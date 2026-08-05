/**
 * InterviewSession — React context that holds the entire guest interview
 * session in client-side state. No database, no auth required.
 *
 * Pages read/write this context instead of router state or mock arrays.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ── Types ── */

export interface Keyword {
  name: string;
  count: number;
}

export interface QuestionAnswer {
  question: string;
  answer: string;           // transcript text
  fillerCount: number;
  fillerWords: string[];
}

export interface PerQuestionResult {
  question: string;
  score: number;
  feedback: string;
  tips: string[];
}

export interface SkillMatch {
  matched: string[];
  missing: string[];
}

export interface Delivery {
  feedback: string;
}

export interface EvaluationData {
  overallScore: number;
  perQuestion: PerQuestionResult[];
  skillMatch: SkillMatch;
  delivery: Delivery;
}

export interface InterviewSessionState {
  role: string;
  language: "en" | "id";
  keywords: Keyword[];
  questions: string[];
  answers: QuestionAnswer[];
  totalFillerCount: number;
  evaluation: EvaluationData | null;
  isLoading: boolean;
  error: string | null;
}

interface InterviewSessionContextValue {
  session: InterviewSessionState;
  setRole: (role: string) => void;
  setLanguage: (lang: "en" | "id") => void;
  setKeywords: (keywords: Keyword[]) => void;
  setQuestions: (questions: string[]) => void;
  addAnswer: (answer: QuestionAnswer) => void;
  setEvaluation: (evaluation: EvaluationData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/* ── Default state ── */

const initialState: InterviewSessionState = {
  role: "",
  language: "en",
  keywords: [],
  questions: [],
  answers: [],
  totalFillerCount: 0,
  evaluation: null,
  isLoading: false,
  error: null,
};

/* ── Context ── */

const InterviewSessionContext = createContext<InterviewSessionContextValue | null>(
  null,
);

/* ── Provider ── */

export function InterviewSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSessionState>(initialState);

  const setRole = useCallback((role: string) => {
    setSession((prev) => ({ ...prev, role }));
  }, []);

  const setLanguage = useCallback((language: "en" | "id") => {
    setSession((prev) => ({ ...prev, language }));
  }, []);

  const setKeywords = useCallback((keywords: Keyword[]) => {
    setSession((prev) => ({ ...prev, keywords }));
  }, []);

  const setQuestions = useCallback((questions: string[]) => {
    setSession((prev) => ({ ...prev, questions }));
  }, []);

  const addAnswer = useCallback((answer: QuestionAnswer) => {
    setSession((prev) => ({
      ...prev,
      answers: [...prev.answers, answer],
      totalFillerCount: prev.totalFillerCount + answer.fillerCount,
    }));
  }, []);

  const setEvaluation = useCallback((evaluation: EvaluationData) => {
    setSession((prev) => ({ ...prev, evaluation }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setSession((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setSession((prev) => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setSession(initialState);
  }, []);

  return (
    <InterviewSessionContext.Provider
      value={{
        session,
        setRole,
        setLanguage,
        setKeywords,
        setQuestions,
        addAnswer,
        setEvaluation,
        setLoading,
        setError,
        reset,
      }}
    >
      {children}
    </InterviewSessionContext.Provider>
  );
}

/* ── Hook ── */

export function useInterviewSession() {
  const ctx = useContext(InterviewSessionContext);
  if (!ctx) {
    throw new Error(
      "useInterviewSession must be used within an InterviewSessionProvider",
    );
  }
  return ctx;
}