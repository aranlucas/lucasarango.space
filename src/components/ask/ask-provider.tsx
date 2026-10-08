"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import { AskContext, type AskState, type PendingQuestion } from "@/components/ask/ask-context";

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

/** Lightweight layout state; the chat runtime only mounts after reader intent. */
export function AskProvider({ children }: { children: React.ReactNode }) {
  const state = useAskState();

  return <AskContext value={state}>{children}</AskContext>;
}
