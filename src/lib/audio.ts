/**
 * Audio pipeline — PCM Int16 at 16 kHz.
 *
 * Designed to work with a *single* existing AudioContext and media stream
 * (no duplicate getUserMedia calls), which is critical for Bluetooth / TWS
 * headsets where multiple AudioContexts cause resource contention.
 */

export interface AudioCapture {
  /** Start capturing and feeding PCM binary to the given callback. */
  start: (onChunk: (data: ArrayBuffer) => void) => void;
  /** Stop the processor. */
  stop: () => void;
}

/**
 * Create an AudioCapture that emits 16 kHz PCM S16LE chunks.
 *
 * Unlike the previous version this does NOT call getUserMedia() or create
 * its own AudioContext — it expects a pre-existing stream + AudioContext
 * so there is only ONE audio pipeline in the app.
 *
 * Each chunk is ~64 ms of audio (1024 samples at 16 kHz, 16-bit mono).
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
      
      /* Use ScriptProcessorNode with bufferSize 1024 → ~64 ms at 16 kHz.
         The browser deprecation warning is cosmetic — the API still works. */
      processor = audioCtx.createScriptProcessor(1024, 1, 1);

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
      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const input = event.inputBuffer.getChannelData(0); // Float32  [-1, 1]
        const int16 = float32ToInt16(input);
        chunkCount++;
        if (chunkCount === 1 || chunkCount % 100 === 0) {
          /* Check if audio is actually non-silent */
          const maxAmp = Math.max(...Array.from(input).map(Math.abs));
          console.log(`[Audio] Chunk #${chunkCount} — max amplitude=${maxAmp.toFixed(4)}, ${int16.byteLength} bytes`);
        }
        onChunk(int16.buffer as ArrayBuffer);
      };

      console.log("[Audio] Capture started, processor connected to destination");
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

/** Convert a Float32Array (values -1..1) to Int16Array and return it. */
function float32ToInt16(float32: Float32Array): Int16Array {
  const len = float32.length;
  const int16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}
