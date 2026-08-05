import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInterviewSession, type QuestionAnswer } from "../lib/InterviewSession";
import { createAudioCapture } from "../lib/audio";
import {
  startSpeechmaticsSession,
  countFillerWords,
  type TranscriptEvent,
  type SpeechmaticsSession,
} from "../lib/speechmatics";
import { supabase } from "../lib/supabaseClient";

const starHints = [
  { label: "Situation", text: "Describe the context — the project, team, and what made it complex." },
  { label: "Task", text: "Explain your specific responsibility and what needed to be achieved." },
  { label: "Action", text: "Walk through the steps you took — tools, techniques, decisions." },
  { label: "Result", text: "Share the measurable outcome — faster load times, happier users, etc." },
];

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
  const navigate = useNavigate();
  const { session, addAnswer, setEvaluation, setError, setLoading } = useInterviewSession();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  /* Speechmatics state */
  const [partialTranscript, setPartialTranscript] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentFillerCount, setCurrentFillerCount] = useState(0);

  /* Fallback textarea (mic unavailable) */
  const [micError, setMicError] = useState<string | null>(null);
  const [useTextarea, setUseTextarea] = useState(false);
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
  const audioCaptureRef = useRef<ReturnType<typeof createAudioCapture> | null>(null);
  const smSessionRef = useRef<SpeechmaticsSession | null>(null);
  const queueRef = useRef<AudioChunkQueue | null>(null);
  /* Track latest answers in a ref so async callbacks never use stale values */
  const answersRef = useRef<QuestionAnswer[]>(session.answers);
  const currentFillerWordsRef = useRef<string[]>([]);

  const questions = session.questions;
  const totalQuestions = questions.length;

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
    setMicError(null);
    setUseTextarea(false);
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
      /* 1. Get mic stream */
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      /* 2. AudioContext + Analyser for visualiser */
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
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

      /* 5. Audio capture + chunk queue */
      const capture = createAudioCapture();
      audioCaptureRef.current = capture;
      const queue = new AudioChunkQueue();
      queueRef.current = queue;

      /* 6. Speechmatics session */
      const lang = session.language || "en";
      const vocab = [session.role, ...session.keywords.map((k) => k.name)].filter(Boolean);
      const smSession = await startSpeechmaticsSession(
        lang as "en" | "id",
        (event: TranscriptEvent) => {
          if (event.type === "partial") {
            setPartialTranscript(event.text);
          } else if (event.type === "final") {
            setCurrentTranscript((prev) => (prev ? prev + " " : "") + event.text);
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
      capture.start((chunk: ArrayBuffer) => {
        if (queueRef.current) queueRef.current.push(chunk);
      });
    } catch (err: unknown) {
      cleanupAll();
      setMicState("idle");
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setMicError("Microphone access was denied. Type your answer instead.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setMicError("No microphone found. Type your answer instead.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to start";
        setMicError(`Voice service temporarily unavailable — ${msg}. Type your answer instead.`);
      }
      setUseTextarea(true);
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

    /* Gracefully close Speechmatics — this sends end_of_stream,
       waits for EndOfTranscript (up to 3s), then closes the WS. */
    if (smSessionRef.current) {
      try {
        await smSessionRef.current.closeGracefully(3000);
      } catch {
        /* fallback: force close */
        try { smSessionRef.current?.close(); } catch {}
      }
      smSessionRef.current = null;
    }

    /* End the audio chunk queue after the WS has finished */
    if (queueRef.current) { queueRef.current.end(); queueRef.current = null; }

    setTimeout(() => {
      setMicState("idle");
      setHasRecording(true);
    }, 800);
  }, []);

  const toggleRecording = () => {
    if (micState === "idle" && !useTextarea) {
      startRecording();
    } else if (micState === "recording") {
      stopRecording();
    }
  };

  /* ── Submit current answer and advance / finish ── */
  const submitCurrentAnswer = useCallback(() => {
    const answerText = useTextarea ? textAnswer.trim() : currentTranscript.trim();
    const fillerCount = useTextarea ? 0 : currentFillerCount;
    const fillerWords: string[] = useTextarea
      ? []
      : [...currentFillerWordsRef.current];

    addAnswer({
      question: questions[questionIndex],
      answer: answerText || "[No answer provided]",
      fillerCount,
      fillerWords,
    });
  }, [useTextarea, textAnswer, currentTranscript, currentFillerCount, addAnswer, questions, questionIndex]);

  const handleFinishEvaluation = useCallback(async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setLoading(true);
    try {
      /* Use ref to always send the latest answers, even when called
         immediately after addAnswer before React re-renders */
      const { data, error } = await supabase.functions.invoke("evaluation", {
        body: {
          role: session.role,
          language: session.language || "en",
          keywords: session.keywords,
          questions: session.questions,
          answers: answersRef.current,
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
  }, [isEvaluating, session, setLoading, setEvaluation, navigate]);

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
    if (!useTextarea && !hasRecording) {
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
  }, [questionIndex, totalQuestions, resetPerQuestion, addAnswer, questions, useTextarea, hasRecording, handleFinishEvaluation]);

  const handleRetry = useCallback(() => {
    /* If in textarea mode with text, keep it */
    if (useTextarea) {
      setHasRecording(false);
      setMicState("idle");
      return;
    }
    resetPerQuestion();
  }, [useTextarea, resetPerQuestion]);

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
        if (useTextarea) return "bg-muted border-2 border-border text-muted-foreground opacity-50 cursor-not-allowed";
        return "bg-white border-2 border-border text-muted-foreground hover:border-accent hover:text-accent shadow-md";
    }
  };

  const getStatusText = () => {
    if (useTextarea && !micError) return { text: "Type your answer below", color: "text-muted-foreground" };
    if (micError) return { text: micError, color: "text-amber-600" };
    switch (micState) {
      case "recording":
        return { text: "Recording... Tap to stop", color: "text-destructive" };
      case "processing":
        return { text: "Processing Audio...", color: "text-accent" };
      default:
        if (hasRecording) return { text: "Answer recorded", color: "text-accent" };
        return { text: "Tap to start recording", color: "text-muted-foreground" };
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col">
      {/* Top status bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Mock Interview</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            Question {questionIndex + 1} of {totalQuestions}
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
                Interviewer
              </span>
            </div>
            <p className="text-lg sm:text-xl text-foreground font-heading font-medium leading-relaxed">
              {questions[questionIndex]}
            </p>
            <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              Take a moment to gather your thoughts, then press the microphone and speak your answer clearly.
            </p>

            {/* Live partial transcript during recording */}
            {(micState === "recording" || micState === "processing") && partialTranscript && (
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium mb-1">Live transcription</p>
                <p className="text-sm text-foreground italic leading-relaxed">{partialTranscript}</p>
              </div>
            )}

            {/* Final transcript after stop */}
            {hasRecording && !useTextarea && micState !== "recording" && micState !== "processing" && currentTranscript && (
              <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-xs text-accent font-medium mb-1">
                  Your answer ({currentFillerCount} filler word{currentFillerCount !== 1 ? "s" : ""})
                </p>
                <p className="text-sm text-foreground leading-relaxed">{currentTranscript}</p>
              </div>
            )}

            {/* Mic error banner */}
            {micError && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {micError}
              </div>
            )}

            {/* Textarea fallback when mic unavailable */}
            {useTextarea && (
              <div className="mt-4">
                <label htmlFor="text-answer" className="block text-sm font-medium text-foreground mb-2">
                  Type your answer
                </label>
                <textarea
                  id="text-answer"
                  rows={5}
                  placeholder="Type your answer here..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-2 focus-visible:outline-ring resize-y"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {textAnswer.trim().length > 0
                    ? `${textAnswer.trim().split(/\s+/).length} words`
                    : "Answer will be evaluated as-is."}
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
                {showHint ? "Hide Hint" : "Need a Hint?"}
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
                    STAR Method Hint
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {starHints.map((h) => (
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
                        Generating personalised hint...
                      </div>
                    )}
                    {/* Error state */}
                    {hintError && !hintLoading && (
                      <div className="flex items-center justify-between gap-2 text-sm text-amber-700">
                        <span>Couldn't generate a hint right now.</span>
                        <button
                          onClick={() => fetchHint(questions[questionIndex])}
                          className="text-xs font-semibold text-accent hover:text-accent/80 underline cursor-pointer"
                        >
                          Retry
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
                          <span className="font-semibold">Interviewer Agent Suggestion:</span>{" "}
                          {hintSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              disabled={useTextarea}
              className={`btn-active w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 relative cursor-pointer ${getMicButtonClasses()}`}
              aria-label={
                micState === "recording"
                  ? "Stop recording"
                  : micState === "processing"
                  ? "Processing audio"
                  : "Start recording"
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
              <span className={`text-sm font-medium transition-all duration-200 ${getStatusText().color}`}>
                {getStatusText().text}
              </span>
              {micState === "recording" && (
                <>
                  <span className="text-sm font-mono font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                    {formatTime(elapsed)}
                  </span>
                  {currentFillerCount > 0 && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {currentFillerCount} filler word{currentFillerCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-4 mt-2">
              {/* Skip button (visible when idle and not recorded) */}
              {micState === "idle" && !hasRecording && !useTextarea && (
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

              {/* Next / Finish button */}
              {hasRecording && !isEvaluating && (
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
        </div>
      )}
    </div>
  );
}