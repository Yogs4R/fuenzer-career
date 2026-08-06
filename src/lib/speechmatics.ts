/**
 * Speechmatics real-time transcription client.
 *
 * Protocol flow:
 *   1. Fetch a short-lived JWT from our Edge Function.
 *   2. Open a WebSocket to the Speechmatics RT endpoint.
 *   3. Send StartRecognition with audio_format + transcription_config.
 *   4. Stream raw PCM 16 kHz binary chunks, counting each as seqNo.
 *   5. Send EndOfStream { message, last_seq_no }.
 *   6. Receive AddPartialTranscript / AddTranscript / EndOfTranscript.
 */

import { supabase } from "./supabaseClient";

/* ── Types ── */

export interface SpeechmaticsWord {
  word: string;
  start_time: number;
  end_time: number;
  /** e.g. ["Disfluency", "FilledPause"] — if present, this is a filler word */
  tags?: string[];
}

export interface PartialTranscript {
  type: "partial";
  text: string;
}

export interface FinalTranscript {
  type: "final";
  text: string;
  words: SpeechmaticsWord[];
}

export type TranscriptEvent = PartialTranscript | FinalTranscript;

export interface SpeechmaticsSession {
  /** Force-close the WebSocket immediately. */
  close: () => void;
  /**
   * Gracefully end the session:
   *   1. Sends EndOfStream { message, last_seq_no } if not already sent.
   *   2. Waits for EndOfTranscript (up to `timeoutMs`).
   *   3. Then closes the WebSocket.
   */
  closeGracefully: (timeoutMs?: number) => Promise<void>;
}

/* ── Token fetch ── */

async function fetchToken(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{
    token: string;
  }>("speechmatics-token", { method: "POST" });

  if (error || !data?.token) {
    throw new Error(error?.message ?? "Failed to fetch Speechmatics token");
  }
  return data.token;
}

/* ── Session ── */

/**
 * Start a Speechmatics real-time transcription session.
 *
 * @param language      - "en" or "id"
 * @param onEvent       - called on each transcript event
 * @param audioChunks   - a readable async iterable of ArrayBuffer (PCM S16LE, 16 kHz mono)
 * @param additionalVocab - role-specific vocabulary to help recognition
 */
export async function startSpeechmaticsSession(
  language: "en" | "id",
  onEvent: (event: TranscriptEvent) => void,
  audioChunks: AsyncIterable<ArrayBuffer>,
  additionalVocab?: string[],
): Promise<SpeechmaticsSession> {
  const token = await fetchToken();
  const wsUrl = `wss://eu.rt.speechmatics.com/v2?jwt=${token}`;

  const ws = new WebSocket(wsUrl);

  /* ── State ── */

  let seqNo = 0;               // incremented for every audio chunk sent
  let endOfStreamSent = false; // prevents double-sending EndOfStream
  let onEndOfTranscript: (() => void) | null = null;

  /* ── Helper: send EndOfStream with the current seqNo ── */

  function sendEndOfStream() {
    if (endOfStreamSent) return;
    endOfStreamSent = true;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: "EndOfStream", last_seq_no: seqNo }));
    }
  }

  /* ── Session object ── */

  const session: SpeechmaticsSession = {
    close: () => {
      ws.close();
    },

    closeGracefully: async (timeoutMs = 3000) => {
      /* Signal that we're done sending audio */
      sendEndOfStream();

      /* Wait for EndOfTranscript or timeout */
      await new Promise<void>((resolve) => {
        onEndOfTranscript = resolve;
        setTimeout(() => {
          onEndOfTranscript = null;
          resolve();
        }, timeoutMs);
      });

      /* Now close the socket */
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
  };

  /* ── WebSocket lifecycle ── */

  await new Promise<void>((resolveOpen, rejectOpen) => {
    /* onopen — send StartRecognition, start audio stream, resolve the open promise */
    ws.onopen = () => {
      /* 1. StartRecognition (MUST be the very first message) */
      ws.send(
        JSON.stringify({
          message: "StartRecognition",
          audio_format: {
            type: "raw",
            encoding: "pcm_s16le",
            sample_rate: 16000,
          },
          transcription_config: {
            language: "auto",
            max_delay: 2,
            enable_partials: true,
            additional_vocab: additionalVocab ?? [],
          },
        }),
      );

      /* 2. Resolve the open promise so startSpeechmaticsSession returns */
      resolveOpen();

      /* 3. Stream audio chunks asynchronously — each chunk increments seqNo */
      (async () => {
        for await (const chunk of audioChunks) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
            seqNo++;
          }
        }
        /* All chunks sent — flush with EndOfStream */
        sendEndOfStream();
      })();
    };

    /* onmessage — route transcript events */
    ws.onmessage = (msg) => {
      try {
        const json = JSON.parse(msg.data);

        if (json.message === "AddPartialTranscript") {
          const text =
            json.results
              ?.map((r: { transcript: string }) => r.transcript)
              .join(" ") ?? "";
          onEvent({ type: "partial", text });
        } else if (json.message === "AddTranscript") {
          const text =
            json.results
              ?.map((r: { transcript: string }) => r.transcript)
              .join(" ") ?? "";
          const words: SpeechmaticsWord[] =
            json.results?.flatMap(
              (r: { alternatives: { words: SpeechmaticsWord[] }[] }) =>
                r.alternatives?.[0]?.words ?? [],
            ) ?? [];
          onEvent({ type: "final", text, words });
        } else if (json.message === "EndOfTranscript") {
          onEndOfTranscript?.();
          onEndOfTranscript = null;
          ws.close();
        }
      } catch {
        /* ignore malformed messages */
      }
    };

    /* onerror — reject the open promise and close */
    ws.onerror = () => {
      rejectOpen(new Error("WebSocket connection failed"));
      ws.close();
    };

    /* Handle the case where the socket is already open (unlikely in practice) */
    if (ws.readyState === WebSocket.OPEN) {
      ws.onopen!(new Event("open"));
    }
  });

  return session;
}

/* ── Filler word detection ── */

/** Known filler words — also checked against Speechmatics' disfluency tags. */
const FILLER_WORDS = new Set([
  "um", "uh", "uhh", "umm", "ah", "er", "like", "you know",
  "actually", "basically", "literally", "sort of", "kind of",
]);

/**
 * Count filler words in a FinalTranscript.
 * Uses the SSML `tags` (Disfluency / FilledPause) where available,
 * and falls back to a simple word-list check.
 */
export function countFillerWords(words: SpeechmaticsWord[]): {
  count: number;
  fillerWords: string[];
} {
  const fillerWords: string[] = [];
  for (const w of words) {
    const isTagged = w.tags?.some(
      (t) => t === "Disfluency" || t === "FilledPause",
    );
    const isKnown = FILLER_WORDS.has(w.word.toLowerCase().replace(/[^a-z]/g, ""));
    if (isTagged || isKnown) {
      fillerWords.push(w.word);
    }
  }
  return { count: fillerWords.length, fillerWords };
}
