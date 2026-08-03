import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockQuestion =
  "Tell me about a time you optimised a complex web application. What approach did you take and what was the outcome?";

export default function InterviewRoom() {
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  const handleFinish = () => {
    navigate("/report");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col">
      {/* Top status bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>Mock Interview</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            Question 1 of 1
          </span>
        </div>
      </div>

      {/* Main content — centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Question Card */}
          <div className="bg-white rounded-xl border border-border shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Interviewer
              </span>
            </div>
            <p className="text-lg sm:text-xl text-foreground font-heading font-medium leading-relaxed">
              {mockQuestion}
            </p>
            <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              Take a moment to gather your thoughts, then press the microphone
              and speak your answer clearly.
            </p>
          </div>

          {/* Microphone + Controls */}
          <div className="flex flex-col items-center gap-6">
            {/* Microphone Button */}
            <button
              onClick={toggleRecording}
              className={`btn-active relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isRecording
                  ? "bg-destructive text-white shadow-xl animate-pulse-recording"
                  : "bg-white border-2 border-border text-muted-foreground hover:border-accent hover:text-accent shadow-md"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.5a4.5 4.5 0 004.5-4.5v-6a4.5 4.5 0 00-9 0v6a4.5 4.5 0 004.5 4.5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 10v4a7 7 0 01-14 0v-4"
                />
                <line x1="12" y1="18.5" x2="12" y2="22" strokeWidth={2} />
              </svg>

              {/* Recording indicator dot */}
              {isRecording && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
              )}
            </button>

            {/* Status label */}
            <span
              className={`text-sm font-medium transition-all duration-200 ${
                isRecording
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {isRecording ? "Recording… Tap to stop" : "Tap to start recording"}
            </span>

            {/* Finish button */}
            <button
              onClick={handleFinish}
              className="btn-active mt-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            >
              Finish &amp; Get Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}