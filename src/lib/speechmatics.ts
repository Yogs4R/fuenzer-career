/**
 * Speechmatics real-time transcription client.
 *
 * 1. Fetch a short-lived JWT from our Edge Function.
 * 2. Open a WebSocket to the Speechmatics RT endpoint.
 * 3. Stream raw PCM 16 kHz binary chunks.
 * 4. Emit partial and final transcripts with per-word disfluency tags.
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
  close: () => void;
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
 * @param language - "en" or "id"
 * @param onEvent  - called on each transcript event
 * @param audioChunks - a readable async iterable of ArrayBuffer (PCM S16LE, 16 kHz mono)
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
  const session: SpeechmaticsSession = { close: () => ws.close() };

  ws.onopen = () => {
    /* Audio format message */
    const startRecognition: Record<string, unknown> = {
      message: "StartRecognition",
      audio_format: {
        type: "raw",
        encoding: "pcm_s16le",
        sample_rate: 16000,
      },
      transcription_config: {
        language,
        max_delay: 2,
        enable_partials: true,
        additional_vocab: additionalVocab ?? [],
      },
    };
    ws.send(JSON.stringify(startRecognition));

    /* Start streaming audio chunks */
    (async () => {
      for await (const chunk of audioChunks) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk);
        }
      }
      /* Signal end-of-audio (the user stopped speaking). The server
         will flush remaining audio and send an EndOfTranscript. */
      ws.send(JSON.stringify({ message: "SetRecognitionConfig", end_of_stream: "end_of_stream" }));
    })();
  };

  ws.onmessage = (msg) => {
    try {
      const json = JSON.parse(msg.data);

      if (json.message === "AddPartialTranscript") {
        const text = json.results?.map((r: { transcript: string }) => r.transcript).join(" ") ?? "";
        onEvent({ type: "partial", text });
      } else if (json.message === "AddTranscript") {
        const text = json.results?.map((r: { transcript: string }) => r.transcript).join(" ") ?? "";
        const words: SpeechmaticsWord[] =
          json.results?.flatMap((r: { alternatives: { words: SpeechmaticsWord[] }[] }) =>
            r.alternatives?.[0]?.words ?? [],
          ) ?? [];
        onEvent({ type: "final", text, words });
      } else if (json.message === "EndOfTranscript") {
        ws.close();
      }
    } catch {
      /* ignore malformed messages */
    }
  };

  ws.onerror = () => {
    ws.close();
  };

  /* Wait until the socket is open before returning */
  await new Promise<void>((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) resolve();
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("WebSocket connection failed"));
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