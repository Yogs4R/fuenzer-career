import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInterviewSession, type QuestionAnswer, LANGUAGES } from "../lib/InterviewSession";
import { createAudioCapture, type AudioCapture } from "../lib/audio";
import {
  startSpeechmaticsSession,
  countFillerWords,
  type TranscriptEvent,
  type SpeechmaticsSession,
} from "../lib/speechmatics";
import { supabase } from "../lib/supabaseClient";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from "../lib/i18n";

type MicState = "idle" | "recording" | "processing";

/* ── Bridge: push-based PCM chunks → async iterable ── */
class AudioChunkQueue {
  private _buffer: ArrayBuffer[] = [];
  private _resolve: ((value: IteratorResult<ArrayBuffer>) => void) | null = null;
  private _ended = false;

  push(chunk: ArrayBuffer) {
    if (this._resolve) {
      const r = this._resolve;
      this._resolve = null;
      r({ value: chunk, done: false as const });
    } else {
      this._buffer.push(chunk);
    }
  }

  end() {
    this._ended = true;
    if (this._resolve) {
      this._resolve({ value: undefined as unknown as ArrayBuffer, done: true as const });
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<ArrayBuffer> {
    return {
      next: (): Promise<IteratorResult<ArrayBuffer>> => {
        if (this._buffer.length > 0) {
          return Promise.resolve({ value: this._buffer.shift()!, done: false as const });
        }
        if (this._ended) {
          return Promise.resolve({ value: undefined as unknown as ArrayBuffer, done: true as const });
        }
        return new Promise<IteratorResult<ArrayBuffer>>((resolve) => {
          this._resolve = resolve;
        });
      },
    };
  }
}

export default function InterviewRoom() {
  usePageTitle("Interview Room");
  const navigate = useNavigate();
  const { session, addAnswer, setEvaluation, setError, setLoading } = useInterviewSession();
  const { t } = useTranslation();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  /* Speechmatics state */
  const [partialTranscript, setPartialTranscript] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentFillerCount, setCurrentFillerCount] = useState(0);

  /* Input mode: mic (voice) or text (typing) */
  const [inputMode, setInputMode] = useState<"mic" | "text">("mic");
  const [micError, setMicError] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");

  /* Evaluation */
  const [isEvaluating, setIsEvaluating] = useState(false);

  /* AI-generated hints */
  const [hintLoading, setHintLoading] = useState(false);
  const [hintSuggestion, setHintSuggestion] = useState("");
  const [hintError, setHintError] = useState<string | null>(null);
  const lastHintQuestionRef = useRef<number>(-1);

  /* Refs */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const smSessionRef = useRef<SpeechmaticsSession | null>(null);
  const queueRef = useRef<AudioChunkQueue | null>(null);
  /* Track latest answers in a ref so async callbacks never use stale values */
  const answersRef = useRef<QuestionAnswer[]>(session.answers);
  const currentFillerWordsRef = useRef<string[]>([]);
  /* ⚠️ CRITICAL: fullTranscriptRef accumulates every AddTranscript text
     synchronously as it arrives from the WebSocket, independent of React
     batching. submitCurrentAnswer reads from this ref (not the state) so
     the transcript is never lost — even if state updates are batched or
     delayed. */
  const fullTranscriptRef = useRef("");

  const questions = session.questions;
  const totalQuestions = questions.length;
  const currentLanguage = LANGUAGES.find((l) => l.code === session.language) ?? LANGUAGES[0];

  /* Keep answersRef in sync with session.answers — ref never goes stale */
  useEffect(() => {
    answersRef.current = session.answers;
  }, [session.answers]);

  /* Redirect if no questions in session */
  useEffect(() => {
    if (totalQuestions === 0) {
      navigate("/", { replace: true });
    }
  }, [totalQuestions, navigate]);

  /* ── Reset per-question state ── */
  const resetPerQuestion = useCallback(() => {
    setPartialTranscript("");
    setCurrentTranscript("");
    setCurrentFillerCount(0);
    fullTranscriptRef.current = "";
    setMicError(null);
    setInputMode("mic");
    setTextAnswer("");
    setHasRecording(false);
    setElapsed(0);
    setShowHint(false);
    setHintLoading(false);
    setHintSuggestion("");
    setHintError(null);
    lastHintQuestionRef.current = -1;
    setMicState("idle");
  }, []);

  /* ── Cleanup all audio / Speechmatics resources ── */
  const cleanupAll = useCallback(() => {
    if (smSessionRef.current) { try { smSessionRef.current.close(); } catch {} smSessionRef.current = null; }
    if (queueRef.current) { try { queueRef.current.end(); } catch {} queueRef.current = null; }
    if (audioCaptureRef.current) { try { audioCaptureRef.current.stop(); } catch {} audioCaptureRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = 0; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  /* ── Helper: visualiser draw loop ── */
  const startVisualiser = useCallback(() => {
    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const bufLen = analyserRef.current.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      analyserRef.current.getByteFrequencyData(data);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const barW = (w / bufLen) * 2.5;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (data[i] / 255) * h;
        ctx.fillStyle = `hsl(${220 + (data[i] / 255) * 40}, 70%, 55%)`;
        ctx.fillRect(x, h - barH, barW - 1, barH);
        x += barW;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  /* ── Start recording pipeline ── */
  const startRecording = useCallback(async () => {
    resetPerQuestion();
    setMicState("recording");

    try {
      /* 1. Get mic stream — disable browser processing (echo cancellation,
         noise suppression, auto gain) which distorts audio for ASR engines. */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      /* 2. AudioContext + Analyser for visualiser */
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      /* Ensure context is running (some browsers start suspended even with user gesture) */
      if (audioCtx.state === "suspended") {
        console.log("[InterviewRoom] AudioContext suspended — resuming...");
        await audioCtx.resume();
        console.log("[InterviewRoom] AudioContext resumed — state:", audioCtx.state, "sampleRate:", audioCtx.sampleRate);
      } else {
        console.log("[InterviewRoom] AudioContext running — state:", audioCtx.state, "sampleRate:", audioCtx.sampleRate);
      }
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      /* 3. Timer */
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

      /* 4. Visualiser */
      startVisualiser();

      /* 5. Audio capture — uses the SAME AudioContext and source as the
           visualizer (no duplicate getUserMedia), critical for TWS/Bluetooth. */
      const capture = createAudioCapture(audioCtx, source);
      audioCaptureRef.current = capture;
      const queue = new AudioChunkQueue();
      queueRef.current = queue;

      /* 6. Speechmatics session */
      const lang = session.language || "en";
      /* additional_vocab must be objects: { content: "..." } */
      const vocab = [session.role, ...session.keywords.map((k) => k.name)]
        .filter(Boolean)
        .map((v) => ({ content: v }));
      const smSession = await startSpeechmaticsSession(
        lang as "en" | "id" | "ja" | "fr" | "de",
        (event: TranscriptEvent) => {
          if (event.type === "partial") {
            setPartialTranscript(event.text);
          } else if (event.type === "final") {
            console.log("[InterviewRoom] onEvent FINAL — text:", event.text, "words:", event.words.length);
            /* Update state for display */
            setCurrentTranscript((prev) => (prev ? prev + " " : "") + event.text);
            /* ⚠️ CRITICAL: Update ref synchronously too — submitCurrentAnswer
               reads from this ref (not state) so the transcript is never lost
               regardless of React batching timing. */
            fullTranscriptRef.current += (fullTranscriptRef.current ? " " : "") + event.text;
            console.log("[InterviewRoom] fullTranscriptRef.current after append:", JSON.stringify(fullTranscriptRef.current.slice(0, 80)));
            const filler = countFillerWords(event.words);
            setCurrentFillerCount((prev) => prev + filler.count);
            /* Track actual filler words in a ref so submitCurrentAnswer can read them */
            currentFillerWordsRef.current = [
              ...currentFillerWordsRef.current,
              ...filler.fillerWords,
            ];
          }
        },
        queue,
        vocab,
      );
      smSessionRef.current = smSession;

      /* 7. Feed audio into queue */
      console.log("[InterviewRoom] Starting audio capture...");
      capture.start((chunk: ArrayBuffer) => {
        if (queueRef.current) queueRef.current.push(chunk);
      });
      console.log("[InterviewRoom] Audio capture started, pipeline is live");
    } catch (err: unknown) {
      console.error("[InterviewRoom] startRecording failed:", err);
      cleanupAll();
      setMicState("idle");
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setMicError(t("interview.mic.error.denied"));
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setMicError(t("interview.mic.error.notFound"));
      } else {
        const msg = err instanceof Error ? err.message : t("interview.mic.error.general", { message: "Failed to start" });
        setMicError(msg);
      }
      setInputMode("text");
      setHasRecording(true);
    }
  }, [session, resetPerQuestion, cleanupAll, startVisualiser]);

  /* ── Stop recording pipeline ── */
  const stopRecording = useCallback(async () => {
    setMicState("processing");

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = 0; }
    if (audioCaptureRef.current) { audioCaptureRef.current.stop(); audioCaptureRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    /* ⚠️ Critical order: end the queue FIRST so the audio loop
       flushes all remaining buffered chunks to the WebSocket and
       sends end_of_stream naturally. Then wait for EndOfTranscript.
       Doing queue.end() AFTER closeGracefully caused the server to
       receive end_of_stream before those chunks arrived, silently
       dropping the final words of the user's answer. */
    if (queueRef.current) { queueRef.current.end(); queueRef.current = null; }

    /* Now wait for Speechmatics to finish — streamEnded is already
       true (set by the async loop), so closeGracefully won't send a
       redundant end_of_stream. It just waits for EndOfTranscript. */
    if (smSessionRef.current) {
      try {
        await smSessionRef.current.closeGracefully(3000);
      } catch {
        /* fallback: force close */
        try { smSessionRef.current?.close(); } catch {}
      }
      smSessionRef.current = null;
    }

    console.log("[InterviewRoom] stopRecording complete — transcript ref:", JSON.stringify(fullTranscriptRef.current.slice(0, 80)), "state:", JSON.stringify(currentTranscript.slice(0, 80)));
    setTimeout(() => {
      setMicState("idle");
      setHasRecording(true);
    }, 800);
  }, []);

  const toggleRecording = () => {
    if (micState === "idle" && inputMode === "mic") {
      startRecording();
    } else if (micState === "recording") {
      stopRecording();
    }
  };

  /* ── Submit current answer and advance / finish ── */
  const submitCurrentAnswer = useCallback(() => {
    const isText = inputMode === "text";
    /* Read transcript from the ref, which is updated synchronously
       as AddTranscript messages arrive — immune to React batching delays.
       Falls back to currentTranscript state for the display value. */
    const transcript = fullTranscriptRef.current || currentTranscript;
    console.log("[InterviewRoom] submitCurrentAnswer — mode:", inputMode, "transcript ref:", JSON.stringify(fullTranscriptRef.current.slice(0, 80)), "state:", JSON.stringify(currentTranscript.slice(0, 80)));
    const answerText = isText ? textAnswer.trim() : transcript.trim();
    const fillerCount = isText ? 0 : currentFillerCount;
    const fillerWords: string[] = isText
      ? []
      : [...currentFillerWordsRef.current];

    addAnswer({
      question: questions[questionIndex],
      answer: answerText || "[No answer provided]",
      fillerCount,
      fillerWords,
    });
  }, [inputMode, textAnswer, currentTranscript, currentFillerCount, addAnswer, questions, questionIndex]);

  const handleFinishEvaluation = useCallback(async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setLoading(true);
    try {
      /*
       * ═══════════════════════════════════════════════════════════════════
       * CRITICAL TIMING FIX
       * ──────────────────────────────────────────────────────────────────
       * handleNext calls submitCurrentAnswer (→ addAnswer → setSession)
       * then immediately calls handleFinishEvaluation in the same
       * synchronous execution context. React state hasn't flushed yet,
       * so answersRef.current is still the OLD array that does NOT
       * include the latest answer.
       *
       * The fix: build the current question's answer directly from refs
       * (fullTranscriptRef is updated synchronously in onEvent) and
       * merge it with answersRef.current so the Edge Function always
       * receives the COMPLETE set of answers.
       * ═══════════════════════════════════════════════════════════════════
       */
      const isText = inputMode === "text";
      const transcript = fullTranscriptRef.current || currentTranscript;
      const answerText = isText ? textAnswer.trim() : transcript.trim();
      const latestAnswer: QuestionAnswer = {
        question: questions[questionIndex],
        answer: answerText || "[No answer provided]",
        fillerCount: isText ? 0 : currentFillerCount,
        fillerWords: isText ? [] : [...currentFillerWordsRef.current],
      };
      const allAnswers = [...answersRef.current, latestAnswer];

      const { data, error } = await supabase.functions.invoke("evaluation", {
        body: {
          role: session.role,
          language: session.language || "en",
          keywords: session.keywords,
          questions: session.questions,
          answers: allAnswers,
        },
      });
      if (error) throw new Error(error.message);
      setEvaluation(data);
      navigate("/report");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Evaluation failed";
      setError(msg);
      setLoading(false);
      setIsEvaluating(false);
    }
  }, [
    isEvaluating,
    session,
    setLoading,
    setEvaluation,
    navigate,
    inputMode,
    textAnswer,
    currentTranscript,
    currentFillerCount,
    questions,
    questionIndex,
  ]);

  const handleNext = useCallback(() => {
    submitCurrentAnswer();
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((p) => p + 1);
      resetPerQuestion();
    } else {
      /* Last question — trigger evaluation */
      handleFinishEvaluation();
    }
  }, [submitCurrentAnswer, questionIndex, totalQuestions, resetPerQuestion, handleFinishEvaluation]);

  const handleSkip = useCallback(() => {
    /* Add empty answer for skipped question */
    if (inputMode === "mic" && !hasRecording) {
      addAnswer({
        question: questions[questionIndex],
        answer: "[Skipped]",
        fillerCount: 0,
        fillerWords: [],
      });
    }
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((p) => p + 1);
      resetPerQuestion();
    } else {
      handleFinishEvaluation();
    }
  }, [questionIndex, totalQuestions, resetPerQuestion, addAnswer, questions, inputMode, hasRecording, handleFinishEvaluation]);

  const handleRetry = useCallback(() => {
    /* If in text mode, clear and switch back to mic */
    if (inputMode === "text") {
      setInputMode("mic");
      setTextAnswer("");
      setHasRecording(false);
      setMicState("idle");
      return;
    }
    resetPerQuestion();
  }, [inputMode, resetPerQuestion]);

  /* ── Fetch AI-generated STAR hint for the current question ── */
  const fetchHint = useCallback(async (question: string) => {
    setHintLoading(true);
    setHintError(null);
    try {
      const { data, error } = await supabase.functions.invoke("interview-hint", {
        body: {
          role: session.role,
          language: session.language || "en",
          question,
          keywords: session.keywords,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.suggestion) {
        setHintSuggestion(data.suggestion);
      } else {
        throw new Error("No hint generated");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load hint";
      setHintError(msg);
      setHintSuggestion("");
    } finally {
      setHintLoading(false);
    }
  }, [session.role, session.language, session.keywords]);

  /* ── Auto-fetch hint when the panel opens for a new question ── */
  useEffect(() => {
    if (showHint && lastHintQuestionRef.current !== questionIndex) {
      lastHintQuestionRef.current = questionIndex;
      fetchHint(questions[questionIndex]);
    }
  }, [showHint, questionIndex, questions, fetchHint]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  /* ── Format elapsed time ── */
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* ── Button classes ── */
  const getMicButtonClasses = () => {
    switch (micState) {
      case "recording":
        return "bg-destructive text-white shadow-xl animate-pulse-recording";
      case "processing":
        return "bg-accent/10 text-accent border-2 border-accent shadow-md";
      default:
        if (inputMode !== "mic") return "bg-muted border-2 border-border text-muted-foreground opacity-50 cursor-not-allowed";
        return "bg-white border-2 border-border text-muted-foreground hover:border-accent hover:text-accent shadow-md";
    }
  };

  const statusInfo = (() => {
    if (inputMode === "text" && !micError) return { text: t("interview.status.typeAnswer"), color: "text-muted-foreground" };
    if (micError) return { text: micError, color: "text-amber-600" };
    switch (micState) {
      case "recording":
        return { text: t("interview.status.recording"), color: "text-destructive" };
      case "processing":
        return { text: t("interview.status.processing"), color: "text-accent" };
      default:
        if (hasRecording) return { text: t("interview.status.recorded"), color: "text-accent" };
        return { text: t("interview.status.tapToStart"), color: "text-muted-foreground" };
    }
  })();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col">
      {/* Top status bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{t("interview.topBar.label")}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/8 text-accent border border-accent/15 px-2 py-0.5 rounded-full">
              <span aria-hidden="true">{currentLanguage.flag}</span>
              {currentLanguage.label}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {t("interview.topBar.questionCount", { current: questionIndex + 1, total: totalQuestions })}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl">
          {/* Question Card — wider max-w */}
          <div className="bg-white rounded-xl border border-border shadow-lg p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {t("interview.questionCard.interviewer")}
              </span>
            </div>
            <p className="text-lg sm:text-xl text-foreground font-heading font-medium leading-relaxed">
              {questions[questionIndex]}
            </p>
            <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              {inputMode === "mic"
                ? t("interview.questionCard.instructionVoice")
                : t("interview.questionCard.instructionText")}
            </p>

            {/* Live partial transcript during recording */}
            {(micState === "recording" || micState === "processing") && partialTranscript && (
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium mb-1">{t("interview.questionCard.liveTranscript")}</p>
                <p className="text-sm text-foreground italic leading-relaxed">{partialTranscript}</p>
              </div>
            )}

            {/* Final transcript after stop */}
            {(() => {
              const displayTranscript = fullTranscriptRef.current || currentTranscript;
              return hasRecording && inputMode === "mic" && micState !== "recording" && micState !== "processing" && displayTranscript.trim() ? (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs text-accent font-medium mb-1">
                    {t("interview.questionCard.yourAnswer")} ({t("interview.questionCard.fillerWords", { count: currentFillerCount })})
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{displayTranscript}</p>
                </div>
              ) : null;
            })()}

            {/* Mic error banner */}
            {micError && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {micError}
              </div>
            )}

            {/* Textarea for typing answers */}
            {inputMode === "text" && (
              <div className="mt-4">
                <label htmlFor="text-answer" className="block text-sm font-medium text-foreground mb-2">
                  {t("interview.textarea.label")}
                </label>
                <textarea
                  id="text-answer"
                  rows={5}
                  placeholder={t("interview.textarea.placeholder")}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-2 focus-visible:outline-ring resize-y"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {textAnswer.trim().length > 0
                    ? t("interview.textarea.words", { count: textAnswer.trim().split(/\s+/).length })
                    : t("interview.textarea.emptyHint")}
                </p>
              </div>
            )}

            {/* Need a Hint? — inline collapsible inside the question card */}
            <div className="mt-4">
              <button
                onClick={() => setShowHint((p) => !p)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
                aria-expanded={showHint}
                aria-controls="star-hint-panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                {showHint ? t("interview.hint.hide") : t("interview.hint.button")}
              </button>

              {/* Inline collapsible STAR hints */}
              <div
                id="star-hint-panel"
                role="region"
                aria-labelledby="hint-title"
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  showHint ? "max-h-[40rem] opacity-100 mt-3" : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-muted/40 rounded-xl border border-border p-4 sm:p-5 space-y-3">
                  <h3 id="hint-title" className="font-heading text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    {t("interview.hint.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: t("interview.hint.star.situation"), text: t("interview.hint.star.situationDesc") },
                      { label: t("interview.hint.star.task"), text: t("interview.hint.star.taskDesc") },
                      { label: t("interview.hint.star.action"), text: t("interview.hint.star.actionDesc") },
                      { label: t("interview.hint.star.result"), text: t("interview.hint.star.resultDesc") },
                    ].map((h) => (
                      <div key={h.label} className="bg-white rounded-lg p-3 border border-border/50">
                        <span className="text-xs font-bold text-accent uppercase block mb-1">
                          {h.label}
                        </span>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {h.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 min-h-[3rem]">
                    {/* Loading state */}
                    {hintLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("interview.hint.loading")}
                      </div>
                    )}
                    {/* Error state */}
                    {hintError && !hintLoading && (
                      <div className="flex items-center justify-between gap-2 text-sm text-amber-700">
                        <span>{t("interview.hint.error")}</span>
                        <button
                          onClick={() => fetchHint(questions[questionIndex])}
                          className="text-xs font-semibold text-accent hover:text-accent/80 underline cursor-pointer"
                        >
                          {t("interview.hint.retry")}
                        </button>
                      </div>
                    )}
                    {/* Success state */}
                    {hintSuggestion && !hintLoading && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                        <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                          <span className="font-semibold">{t("interview.hint.suggestionLabel")}</span>{" "}
                          {hintSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language tip */}
          <p className="text-xs text-muted-foreground text-center mb-4">
            {t("interview.tip", { language: currentLanguage.label })}
          </p>

          {/* Microphone + Controls */}
          <div className="flex flex-col items-center gap-5">
            {/* Visualizer canvas */}
            <canvas
              ref={canvasRef}
              width={300}
              height={60}
              className={`w-full max-w-[300px] h-12 rounded-lg bg-muted/30 transition-opacity duration-300 ${
                micState === "recording" ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            />

            {/* Microphone Button */}
            <button
              onClick={toggleRecording}
              disabled={inputMode !== "mic"}
              className={`btn-active w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 relative cursor-pointer ${getMicButtonClasses()}`}
              aria-label={
                micState === "recording"
                  ? t("interview.mic.aria.stop")
                  : micState === "processing"
                  ? t("interview.mic.aria.processing")
                  : t("interview.mic.aria.start")
              }
            >
              {micState === "processing" ? (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a4.5 4.5 0 004.5-4.5v-6a4.5 4.5 0 00-9 0v6a4.5 4.5 0 004.5 4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v4a7 7 0 01-14 0v-4" />
                  <line x1="12" y1="18.5" x2="12" y2="22" strokeWidth={2} />
                </svg>
              )}
            </button>

            {/* Status label + Timer + Filler badge */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium transition-all duration-200 ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {micState === "recording" && (
                <>
                  <span className="text-sm font-mono font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                    {formatTime(elapsed)}
                  </span>
                  {currentFillerCount > 0 && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {t("interview.mic.fillerBadge", { count: currentFillerCount })}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Mode toggle: switch between mic and text */}
            {micState === "idle" && !isEvaluating && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cleanupAll();
                    setInputMode(inputMode === "mic" ? "text" : "mic");
                    setHasRecording(false);
                    setMicState("idle");
                    setTextAnswer("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
                >
                  {inputMode === "mic" ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m0 4a3 3 0 110 6 3 3 0 010-6zm7 4v2m0 4h.01" />
                      </svg>
                      {t("interview.mic.toggleToText")}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a4.5 4.5 0 004.5-4.5v-6a4.5 4.5 0 00-9 0v6a4.5 4.5 0 004.5 4.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v4a7 7 0 01-14 0v-4" />
                      </svg>
                      {t("interview.mic.toggleToMic")}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action buttons row */}
            <div className="flex items-center gap-4 mt-2">
              {/* Skip button (visible when idle and not recorded) */}
              {micState === "idle" && !hasRecording && inputMode === "mic" && (
                <button
                  onClick={handleSkip}
                  className="btn-active px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 border-2 border-border text-muted-foreground hover:border-accent hover:text-accent hover:-translate-y-0.5"
                >
                  Skip Question
                </button>
              )}

              {/* Retry button (visible after recording) */}
              {hasRecording && !isEvaluating && (
                <button
                  onClick={handleRetry}
                  className="btn-active px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 border-2 border-border text-muted-foreground hover:border-amber-500 hover:text-amber-600 hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                    Retry
                  </span>
                </button>
              )}

              {/* Next / Finish button — in textarea mode, require non-empty text */}
              {hasRecording && !isEvaluating && (inputMode === "mic" || textAnswer.trim().length > 0) && (
                <button
                  onClick={handleNext}
                  className="btn-active px-8 py-2.5 rounded-lg font-semibold text-sm shadow-md cursor-pointer transition-all duration-200 bg-primary hover:bg-primary/90 text-white hover:-translate-y-0.5"
                >
                  {questionIndex < totalQuestions - 1 ? "Next Question" : "Finish & Get Result"}
                </button>
              )}

              {/* Evaluating state */}
              {isEvaluating && (
                <div className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent/10 text-accent text-sm font-semibold">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation loading overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-heading text-lg font-semibold text-foreground mt-6">
            Analysing your answers...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The AI is evaluating your responses and preparing feedback.
          </p>

          {/* Provider credits for hackathon jury */}
          <div className="mt-6 flex items-center gap-3 text-[10px] text-muted-foreground/50 font-medium tracking-wide">
            <span>Powered by</span>
            <span>Brightdata</span>
            <span>·</span>
            <span>Speechmatics</span>
            <span>·</span>
            <span>AI/ML API</span>
          </div>
        </div>
      )}
    </div>
  );
}