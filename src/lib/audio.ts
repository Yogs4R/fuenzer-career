/**
 * Audio pipeline — PCM Float32 at 16 kHz.
 *
 * Designed to work with a *single* existing AudioContext and media stream
 * (no duplicate getUserMedia calls), which is critical for Bluetooth / TWS
 * headsets where multiple AudioContexts cause resource contention.
 *
 * Uses Float32 PCM (pcm_f32le) to avoid any int16 conversion artifacts.
 * The ScriptProcessorNode emits Float32 [-1, 1] natively — we send that
 * directly to Speechmatics without conversion.
 */

export interface AudioCapture {
  /** Start capturing and feed PCM binary to the given callback. */
  start: (onChunk: (data: ArrayBuffer) => void) => void;
  /** Stop the processor. */
  stop: () => void;
}

/**
 * Create an AudioCapture that emits 16 kHz PCM F32LE chunks.
 *
 * Unlike the previous version this does NOT call getUserMedia() or create
 * its own AudioContext — it expects a pre-existing stream + AudioContext
 * so there is only ONE audio pipeline in the app.
 *
 * Each chunk is ~128 ms of audio (2048 samples at 16 kHz, 32-bit float mono).
 * Speechmatics recommends 80–200 ms chunk sizes for optimal recognition.
 */
export function createAudioCapture(
  audioCtx: AudioContext,
  source: MediaStreamAudioSourceNode,
): AudioCapture {
  let processor: ScriptProcessorNode | null = null;

  /* For browsers that support it, prefer AudioWorklet — but we ship a
     backwards-compatible ScriptProcessor fallback since AudioWorklet
     requires a separate JS file loaded as a blob. */
  return {
    start(onChunk: (data: ArrayBuffer) => void) {
      console.log(`[Audio] Creating ScriptProcessor — AudioContext state=${audioCtx.state}, sampleRate=${audioCtx.sampleRate}`);
      
      /* Use ScriptProcessorNode with bufferSize 2048 → ~128 ms at 16 kHz.
         Speechmatics minimum recommended chunk is 80 ms (1280 samples).
         The browser deprecation warning is cosmetic — the API still works. */
      processor = audioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(processor);

      /* ⚠️ CRITICAL: Connect processor to destination (via a zero-gain node)
         to keep the audio graph alive. In Chrome and most browsers,
         onaudioprocess will NOT fire if the ScriptProcessorNode isn't
         connected to a consumer that terminates at destination — the graph
         simply stops ticking, no chunks are produced, seqNo stays 0, and
         Speechmatics returns an empty transcript.
         Gain=0 prevents any audio feedback through speakers/headphones. */
      const mute = audioCtx.createGain();
      mute.gain.value = 0;
      processor.connect(mute);
      mute.connect(audioCtx.destination);

      let chunkCount = 0;
      let firstChunkLogged = false;
      let peakAmplitude = 0;
      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const input = event.inputBuffer.getChannelData(0); // Float32 [-1, 1]
        chunkCount++;
        /* Track peak amplitude across ALL chunks to diagnose quiet mics */
        const maxAmp = Math.max(...Array.from(input).map(Math.abs));
        if (maxAmp > peakAmplitude) peakAmplitude = maxAmp;
        /* Log every 10th chunk (every ~1.28s) so we can see speech bursts */
        if (chunkCount === 1 || chunkCount % 10 === 0) {
          console.log(`[Audio] Chunk #${chunkCount} — max=${maxAmp.toFixed(4)}, peak so far=${peakAmplitude.toFixed(4)}, ${input.byteLength} bytes (float32)`);
        }
        /* Log first 10 samples of the first chunk for diagnostics */
        if (!firstChunkLogged) {
          firstChunkLogged = true;
          const first10 = Array.from(input.slice(0, 10)).map(v => v.toFixed(5));
          console.log(`[Audio] First 10 samples: [${first10.join(", ")}]`);
        }
        /* Send a COPY of the Float32 PCM buffer.
           input.buffer is backed by the ScriptProcessorNode's internal buffer
           which gets recycled on the next onaudioprocess call. We must copy it
           before yielding control, otherwise the WebSocket might send zeros. */
        const copy = new Float32Array(input).buffer;
        onChunk(copy as ArrayBuffer);
      };

      console.log("[Audio] Capture started, processor connected to destination (muted)");
    },

    stop() {
      if (processor) {
        try {
          processor.disconnect();
          console.log("[Audio] Capture stopped — processor disconnected");
        } catch {
          /* already disconnected */
        }
        processor = null;
      }
    },
  };
}
