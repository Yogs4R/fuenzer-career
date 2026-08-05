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
  useRef,
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
  fillerWords?: {
    totalCount: number;
    breakdown: { word: string; count: number }[];
    feedback: string;
  };
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

  /* Track previous user value so we detect sign-out transitions */
  const prevUserRef = useRef(user);
  prevUserRef.current = user;

  /*
   * Single combined effect for all persistence concerns.
   *
   * Ordering is critical:
   *   1. Sign-out must clear localStorage & reset session BEFORE any save runs.
   *   2. Guest save must only persist non-empty sessions (has a role), never stale
   *      authenticated data that was left in memory during the sign-out render.
   *   3. Sign-in must clear localStorage and reset in-memory state.
   */
  useEffect(() => {
    const wasSignedIn = !!prevUserRef.current;
    const isNowSignedOut = wasSignedIn && !user;
    const isNowSignedIn = !wasSignedIn && !!user;

    /* ── Sign-out: user went from truthy → null ── */
    if (isNowSignedOut) {
      clearState();
      setSession(initialState);
      return; /* Do NOT save the stale authenticated session */
    }

    /* ── Sign-in: user went from null → truthy ── */
    if (isNowSignedIn) {
      clearState();
      setSession(initialState);
      return;
    }

    /* ── Guest with an active session → persist progressively ── */
    if (!user && session.role) {
      saveState(session);
    }
  }, [user, session]);

  /*
   * Progressive guest saving — call saveState immediately inside functional
   * updaters so data is persisted mid-interview without waiting for a render
   * cycle. This prevents data loss if the component unmounts before the
   * useEffect fires.
   */

  const setRole = useCallback((role: string) => {
    setSession((prev) => ({ ...prev, role }));
  }, []);

  const setLanguage = useCallback((language: "en" | "id") => {
    setSession((prev) => ({ ...prev, language }));
  }, []);

  const setKeywords = useCallback((keywords: Keyword[]) => {
    setSession((prev) => {
      const next = { ...prev, keywords };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
  }, []);

  const setQuestions = useCallback((questions: string[]) => {
    setSession((prev) => {
      const next = { ...prev, questions };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
  }, []);

  const addAnswer = useCallback((answer: QuestionAnswer) => {
    setSession((prev) => {
      const next = {
        ...prev,
        answers: [...prev.answers, answer],
        totalFillerCount: prev.totalFillerCount + answer.fillerCount,
      };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
  }, []);

  const setEvaluation = useCallback((evaluation: EvaluationData) => {
    setSession((prev) => {
      const next = { ...prev, evaluation };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
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
