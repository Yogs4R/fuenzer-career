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

/** Minimal summary of a completed session, stored in localStorage for guests. */
export interface GuestHistoryItem {
  id: string;
  role: string;
  overall_score: number;
  created_at: string;
}

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

export type Language = "en" | "id" | "ja" | "zh" | "fr" | "de";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export type Difficulty = "intern" | "junior" | "senior" | "professional" | "custom";

export const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: "intern", label: "Intern", description: "Entry-level, basic knowledge questions" },
  { value: "junior", label: "Junior", description: "1–3 years of experience" },
  { value: "senior", label: "Senior", description: "4–8 years, leadership & architecture" },
  { value: "professional", label: "Professional", description: "8+ years, expert-level depth" },
  { value: "custom", label: "Custom", description: "Describe your own difficulty level" },
];

export interface InterviewSessionState {
  role: string;
  language: Language;
  difficulty: Difficulty;
  difficultyCustom: string;
  questionCount: number;
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
  setLanguage: (lang: Language) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setDifficultyCustom: (text: string) => void;
  setQuestionCount: (count: number) => void;
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
const GUEST_HISTORY_KEY = "fuenzer_guest_history";

const initialState: InterviewSessionState = {
  role: "",
  language: "en",
  difficulty: "junior",
  difficultyCustom: "",
  questionCount: 5,
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

/* ── Guest history helpers ── */

export function getGuestHistory(): GuestHistoryItem[] {
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export function addGuestSession(item: GuestHistoryItem) {
  try {
    const list = getGuestHistory();
    list.unshift(item);
    /* Keep max 50 entries */
    if (list.length > 50) list.length = 50;
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* storage full — silently fail */
  }
}

export function deleteGuestSession(id: string) {
  try {
    const list = getGuestHistory();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    /* ignore */
  }
}

export function clearGuestHistory() {
  try {
    localStorage.removeItem(GUEST_HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

/** Store the full guest session data under a key derived from the session id. */
export function saveGuestSessionData(id: string, data: {
  role: string;
  questions: string[];
  answers: QuestionAnswer[];
  evaluation: EvaluationData;
  keywords: { name: string; count: number }[];
}) {
  try {
    localStorage.setItem(`fuenzer_guest_session_${id}`, JSON.stringify(data));
  } catch {
    /* storage full — silently fail */
  }
}

/** Retrieve a specific guest session's full data by id. */
export function loadGuestSessionData(id: string): {
  role: string;
  questions: string[];
  answers: QuestionAnswer[];
  evaluation: EvaluationData;
  keywords: { name: string; count: number }[];
} | null {
  try {
    const raw = localStorage.getItem(`fuenzer_guest_session_${id}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
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

  const setLanguage = useCallback((language: Language) => {
    setSession((prev) => ({ ...prev, language }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setSession((prev) => {
      const next = { ...prev, difficulty };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
  }, []);

  const setDifficultyCustom = useCallback((difficultyCustom: string) => {
    setSession((prev) => {
      const next = { ...prev, difficultyCustom };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
  }, []);

  const setQuestionCount = useCallback((questionCount: number) => {
    setSession((prev) => {
      const next = { ...prev, questionCount };
      if (!prevUserRef.current) saveState(next);
      return next;
    });
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
      if (!prevUserRef.current) {
        saveState(next);
        const sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        /* Save to guest history so the NavBar history modal can show it */
        addGuestSession({
          id: sessionId,
          role: prev.role || "Unknown",
          overall_score: evaluation.overallScore ?? 0,
          created_at: new Date().toISOString(),
        });
        /* Also save the full session data for later retrieval on the report page */
        saveGuestSessionData(sessionId, {
          role: prev.role || "Unknown",
          questions: prev.questions,
          answers: prev.answers,
          evaluation,
          keywords: prev.keywords,
        });
      }
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
        setDifficulty,
        setDifficultyCustom,
        setQuestionCount,
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
