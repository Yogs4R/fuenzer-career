/**
 * Audio pipeline: getUserMedia → AudioContext → PCM Int16 at 16 kHz.
 *
 * Returns a function the caller uses to wire the source into a WebSocket
 * (or any other writable sink) and a cleanup function to tear it all down.
 */

export interface AudioCapture {
  /** Start capturing and feeding PCM binary to the given callback. */
  start: (onChunk: (data: ArrayBuffer) => void) => Promise<void>;
  /** Stop the audio context, media stream, and processor. */
  stop: () => void;
}

/**
 * Create an AudioCapture that emits 16 kHz PCM S16LE chunks.
 * Each chunk is ~100 ms of audio (3200 bytes at 16 kHz, 16-bit mono).
 */
export function createAudioCapture(): AudioCapture {
  let audioCtx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;

  return {
    async start(onChunk: (data: ArrayBuffer) => void) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      /* The Speechmatics RT endpoint wants 16 kHz PCM S16LE.
         We request 16 kHz from the browser. */
      const sampleRate = 16000;
      audioCtx = new AudioContext({ sampleRate });

      source = audioCtx.createMediaStreamSource(stream);

      /* ScriptProcessorNode is deprecated but still works cross-browser
         and is simpler than AudioWorklet for this use-case.
         bufferSize 512 → ~32 ms at 16 kHz, good latency. */
      processor = audioCtx.createScriptProcessor(512, 1, 1);

      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0); // Float32 Array
        const int16 = float32ToInt16(input);
        onChunk(int16.buffer as ArrayBuffer);
      };
    },

    stop() {
      if (processor) {
        processor.disconnect();
        processor = null;
      }
      if (source) {
        source.disconnect();
        source = null;
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
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