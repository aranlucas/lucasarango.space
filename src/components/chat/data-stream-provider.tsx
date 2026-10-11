"use client";

import { createContext, use, useState } from "react";

import type { WaitingStatusData } from "@/lib/types";

type DataStreamContextValue = {
  waitingStatus: WaitingStatusData | undefined;
  setWaitingStatus: (status: WaitingStatusData | undefined) => void;
};

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

/** Holds the transient data parts the route streams outside of messages. */
export function DataStreamProvider({ children }: { children: React.ReactNode }) {
  const [waitingStatus, setWaitingStatus] = useState<WaitingStatusData>();

  return (
    <DataStreamContext value={{ waitingStatus, setWaitingStatus }}>{children}</DataStreamContext>
  );
}

export function useDataStream(): DataStreamContextValue {
  const value = use(DataStreamContext);

  if (value === null) throw new Error("useDataStream must be used inside <DataStreamProvider>");

  return value;
}
