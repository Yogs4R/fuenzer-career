/**
 * InterviewSession — React context that holds the entire guest interview
 * session in client-side state. Persisted to localStorage for guest users
 * so data survives page reloads.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

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

const STORAGE_KEY = "fuenzer_interview_session";

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

function loadState(): InterviewSessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      /* Ensure all keys exist */
      return { ...initialState, ...parsed };
    }
  } catch {
    /* ignore corrupt data */
  }
  return initialState;
}

function saveState(state: InterviewSessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ── Context ── */

const InterviewSessionContext = createContext<InterviewSessionContextValue | null>(
  null,
);

/* ── Provider ── */

export function InterviewSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<InterviewSessionState>(() =>
    /* If user is authenticated, start fresh; otherwise restore from localStorage */
    user ? initialState : loadState(),
  );

  /* Persist to localStorage whenever session changes (guest users only) */
  useEffect(() => {
    if (!user) {
      saveState(session);
    }
  }, [session, user]);

  /* Clear localStorage when user signs in */
  useEffect(() => {
    if (user) {
      clearState();
    }
  }, [user]);

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
    clearState();
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