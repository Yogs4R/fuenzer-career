import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const mockQuestions = [
  "Tell me about a time you optimised a complex web application. What approach did you take and what was the outcome?",
  "Describe a situation where you had to work under a tight deadline. How did you manage your time and deliver?",
  "Can you walk me through a project where you collaborated with a cross-functional team? What was your role?",
  "Tell me about a time you received constructive criticism. How did you respond and what did you learn?",
  "Describe a technical challenge you faced that you couldn\u2019t solve immediately. How did you work through it?",
  "Give an example of a time you took initiative beyond your job description. What motivated you?",
  "Tell me about a time you had to communicate a complex idea to a non-technical audience. How did you approach it?",
  "Describe a situation where you disagreed with a teammate or manager. How was it resolved?",
  "Tell me about a project or result you are most proud of. What made it successful?",
  "If you were starting your current role over again, what would you do differently and why?",
];

const starHints = [
  { label: "Situation", text: "Describe the context \u2014 the project, team, and what made it complex." },
  { label: "Task", text: "Explain your specific responsibility and what needed to be achieved." },
  { label: "Action", text: "Walk through the steps you took \u2014 tools, techniques, decisions." },
  { label: "Result", text: "Share the measurable outcome \u2014 faster load times, happier users, etc." },
];

type MicState = "idle" | "recording" | "processing";

export default function InterviewRoom() {
  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  const hintRef = useRef<HTMLDivElement>(null);
  const hintTriggerRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Audio visualiser ── */
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Start / stop recording ── */
  const startRecording = useCallback(async () => {
    setMicState("recording");
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      /* Start timer */
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      /* Start drawing visualiser */
      const draw = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const hue = 220 + (dataArray[i] / 255) * 40;
          ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      /* Permission denied or no mic */
      setMicState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    setMicState("processing");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    /* Stop AudioContext */
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    /* Stop media tracks */
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    /* Stop animation frame */
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    /* Clear canvas */
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setTimeout(() => {
      setMicState("idle");
      setHasRecording(true);
    }, 800);
  }, []);

  const toggleRecording = () => {
    if (micState === "idle") {
      startRecording();
    } else if (micState === "recording") {
      stopRecording();
    }
  };

  const handleNext = () => {
    if (questionIndex < mockQuestions.length - 1) {
      setQuestionIndex((p) => p + 1);
      setHasRecording(false);
      setShowHint(false);
    } else {
      navigate("/report");
    }
  };

  /* ---- close hint on outside click / Escape ---- */
  useEffect(() => {
    if (!showHint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowHint(false); hintTriggerRef.current?.focus(); }
    };
    const onClick = (e: MouseEvent) => {
      if (
        hintRef.current && !hintRef.current.contains(e.target as Node) &&
        hintTriggerRef.current && !hintTriggerRef.current.contains(e.target as Node)
      ) { setShowHint(false); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showHint]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
        return "bg-white border-2 border-border text-muted-foreground hover:border-accent hover:text-accent shadow-md";
    }
  };

  const getStatusText = () => {
    switch (micState) {
      case "recording":
        return { text: "Recording\u2026 Tap to stop", color: "text-destructive" };
      case "processing":
        return { text: "Processing Audio\u2026", color: "text-accent" };
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
            Question {questionIndex + 1} of {mockQuestions.length}
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
              {mockQuestions[questionIndex]}
            </p>
            <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              Take a moment to gather your thoughts, then press the microphone and speak your answer clearly.
            </p>

            {/* Need a Hint? */}
            <div className="mt-4 relative">
              <button
                ref={hintTriggerRef}
                onClick={() => setShowHint((p) => !p)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
              >
                <span className="text-base">\uD83D\uDCA1</span>
                Need a Hint?
              </button>

              {/* Hint panel — wider on desktop */}
              <div
                ref={hintRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="hint-title"
                tabIndex={-1}
                className={`absolute left-0 top-full mt-2 w-full sm:w-[540px] bg-white rounded-xl border border-border shadow-2xl p-5 z-40 transition-all duration-200 ease-out ${
                  showHint
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 id="hint-title" className="font-heading text-sm font-semibold text-foreground">
                    \uD83D\uDCA1 STAR Method Hint
                  </h3>
                  <button
                    onClick={() => { setShowHint(false); hintTriggerRef.current?.focus(); }}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded"
                    aria-label="Close hint"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starHints.map((h) => (
                    <div key={h.label} className="bg-muted/50 rounded-lg p-3">
                      <span className="text-xs font-bold text-accent uppercase block mb-1">
                        {h.label}
                      </span>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {h.text}
                      </p>
                    </div>
                  ))}
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

            {/* Microphone Button — no red dot */}
            <button
              onClick={toggleRecording}
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

            {/* Status label + Timer */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium transition-all duration-200 ${getStatusText().color}`}>
                {getStatusText().text}
              </span>
              {micState === "recording" && (
                <span className="text-sm font-mono font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                  {formatTime(elapsed)}
                </span>
              )}
            </div>

            {/* Finish / Next button */}
            {hasRecording && (
              <button
                onClick={handleNext}
                className="btn-active mt-2 px-8 py-3 rounded-lg font-semibold text-base shadow-md cursor-pointer transition-all duration-200 bg-primary hover:bg-primary/90 text-white hover:-translate-y-0.5"
              >
                {questionIndex < mockQuestions.length - 1 ? "Next Question" : "Finish & Get Result"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}