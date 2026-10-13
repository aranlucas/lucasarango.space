"use client";

import { startTransition, useEffect, useRef, useState, type RefObject } from "react";

import { AskContext, type AskState, type PendingQuestion } from "@/hooks/use-ask";

type AskProviderProps = { children: React.ReactNode };

/** Returns a request to focus the launcher once the panel has closed. */
function useFocusReturn(open: boolean, launcherRef: RefObject<HTMLButtonElement | null>) {
  const requested = useRef(false);
  useEffect(() => {
    if (!open && requested.current) {
      requested.current = false;
      launcherRef.current?.focus();
    }
  }, [open, launcherRef]);

  return () => {
    requested.current = true;
  };
}

function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);
}

function useQuestionQueue() {
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const nextQuestion = useRef(0);

  const queue = (text: string) => {
    const id = nextQuestion.current++;

    setQuestions((pending) => [...pending, { id, text }]);
  };

  const consume = (id: number) => {
    setQuestions((pending) => pending.filter((question) => question.id !== id));
  };

  return { questions, queue, consume };
}

/** Whether the panel is open, closing on Escape and handing focus back to the launcher. */
function usePanel() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useFocusReturn(open, launcherRef);

  // Commit hiding with navigation so its transition morphs the panel into the launcher.
  const hide = () => {
    startTransition(() => {
      setOpen(false);
    });
  };

  const close = () => {
    returnFocus();
    setOpen(false);
  };

  useEscape(open, close);

  return { open, setOpen, launcherRef, hide, close };
}

/**
 * Lightweight layout state; the chat only mounts after reader intent. The
 * React Compiler memoizes the actions and the context value.
 */
export function AskProvider({ children }: AskProviderProps) {
  const { open, setOpen, launcherRef, hide, close } = usePanel();
  const [activated, setActivated] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { questions, queue, consume } = useQuestionQueue();

  const preload = () => {
    setActivated(true);
  };

  const show = () => {
    setActivated(true);
    setOpen(true);
  };

  const ask = (question: string) => {
    queue(question);
    show();
  };

  const state: AskState = {
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
  };

  return <AskContext value={state}>{children}</AskContext>;
}
