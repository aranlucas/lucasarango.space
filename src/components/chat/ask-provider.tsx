"use client";

import {
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

export type PendingQuestion = { id: number; text: string };

/** Whether Ask is open, and questions waiting for the chat to mount. Kept across navigation. */
export type AskState = {
  open: boolean;
  activated: boolean;
  /** False until the deferred chat reports its status. */
  isLoading: boolean;
  questions: PendingQuestion[];
  launcherRef: React.RefObject<HTMLButtonElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Opens Ask and queues a question until the chat mounts. */
  ask: (question: string) => void;
  show: () => void;
  close: () => void;
  /** Collapses without moving focus as a linked page loads. */
  hide: () => void;
  preload: () => void;
  consume: (id: number) => void;
  setLoading: (loading: boolean) => void;
};

const AskContext = createContext<AskState | null>(null);

function useFocusReturn(open: boolean, launcherRef: RefObject<HTMLButtonElement | null>) {
  const requested = useRef(false);
  useEffect(() => {
    if (!open && requested.current) {
      requested.current = false;
      launcherRef.current?.focus();
    }
  }, [open, launcherRef]);

  return useCallback(() => {
    requested.current = true;
  }, []);
}

function useVisibilityActions(setOpen: (open: boolean) => void, returnFocus: () => void) {
  const show = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  // Commit hiding with navigation so its transition morphs the panel into the launcher.
  const hide = useCallback(() => {
    startTransition(() => {
      setOpen(false);
    });
  }, [setOpen]);

  const close = useCallback(() => {
    returnFocus();
    setOpen(false);
  }, [setOpen, returnFocus]);

  return { show, hide, close };
}

function useQuestionQueue(setOpen: (open: boolean) => void, activate: () => void) {
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const nextQuestion = useRef(0);

  const ask = useCallback(
    (text: string) => {
      const id = nextQuestion.current++;

      setQuestions((pending) => [...pending, { id, text }]);
      activate();
      setOpen(true);
    },
    [activate, setOpen],
  );

  const consume = useCallback((id: number) => {
    setQuestions((pending) => pending.filter((question) => question.id !== id));
  }, []);

  return { questions, ask, consume };
}

function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    if (open) document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);
}

function useAskState(): AskState {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const returnFocus = useFocusReturn(open, launcherRef);
  const { show: reveal, close, hide } = useVisibilityActions(setOpen, returnFocus);

  const preload = useCallback(() => {
    setActivated(true);
  }, []);

  const show = useCallback(() => {
    preload();
    reveal();
  }, [preload, reveal]);

  const { questions, ask, consume } = useQuestionQueue(setOpen, preload);
  useEscape(open, close);

  return useMemo(
    () => ({
      open,
      activated,
      isLoading,
      questions,
      launcherRef,
      inputRef,
      ask,
      show,
      close,
      hide,
      preload,
      consume,
      setLoading,
    }),
    [open, activated, isLoading, questions, ask, show, close, hide, preload, consume],
  );
}

/** Lightweight layout state; the chat only mounts after reader intent. */
export function AskProvider({ children }: { children: React.ReactNode }) {
  const state = useAskState();

  return <AskContext value={state}>{children}</AskContext>;
}

export function useAsk(): AskState {
  const value = use(AskContext);

  if (value === null) throw new Error("useAsk must be used inside <AskProvider>");

  return value;
}
