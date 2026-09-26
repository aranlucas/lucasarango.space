---
title: "An agent run should survive a closed tab"
date: 2026-09-25
summary: "The Go agent gateway separates execution, event replay, and human input so a connection is only one way to observe a run."
draft: true
repository: https://github.com/aranlucas/agents
---

A streaming chat response makes it easy to confuse two different things: the work an agent is doing and the connection carrying its output. Close the tab, lose Wi-Fi, or switch devices, and that distinction becomes visible immediately. Has the work stopped? Is it still running somewhere? Can a new connection recover the question the agent was waiting for me to answer?

In my Agents project, the interesting code lives at that boundary. It is a Go gateway for multiple specialist agents, with session storage in D1 and artifacts in R2. This is a local draft about a private repository; the source links below require access.

The execution layer has a narrow job. It emits a run-start event and a state snapshot, invokes the underlying agent runner, converts its output into AG-UI events, and finishes with either success or an interrupt. Authentication, ownership, and replay belong to the surrounding HTTP layer. That separation means a disconnected observer does not automatically define the lifetime of the underlying work. The [run executor](https://github.com/aranlucas/agents/blob/825fb825eb7055722d888da16b7423407105d3e5/agents/internal/agui/executor.go) makes that split explicit.

The replay path is more substantial than a slice of messages. An active run has an identity, a cancellation function, a sequence number, and a bounded event buffer. When durable storage is configured, publishing an event first appends it to the store and then makes it available to local listeners. A gateway replica can use the shared store to discover ownership or request cancellation, while the process doing the work retains a faster local path.

There is a useful detail in the limits: the buffer reserves space for terminal events. Ordinary output cannot consume every last byte and leave the run unable to report that it finished or failed. The current limits are eight mebibytes and 16,384 events, with smaller reserves held back for termination. Those are implementation bounds, not a claim about how much conversation history the product can retain. The [active-run implementation](https://github.com/aranlucas/agents/blob/825fb825eb7055722d888da16b7423407105d3e5/agents/internal/agui/active_runs.go) is concerned with a live replay window.

Human input has a different lifetime again. A request for input may still be unanswered after that live window has ended. The gateway reconstructs unresolved interrupts from durable session events: record each requested input, then remove it when the corresponding function response appears. A reconnect can therefore recover an outstanding question from history instead of relying entirely on the old stream. That behavior is implemented in the [interrupt reconstruction](https://github.com/aranlucas/agents/blob/825fb825eb7055722d888da16b7423407105d3e5/agents/internal/agui/interrupts.go).

I think this is the useful design lesson in the repository: model execution, observation, and pending human decisions separately. They overlap during the happy path, but they stop overlapping as soon as a connection disappears.

There are limits to what this code establishes. Persisting ownership and events does not make an in-flight model invocation magically resumable after every process failure. A replay buffer also needs bounds, expiry, and clear terminal behavior. The project gives those concerns named places in the implementation, which makes their guarantees easier to inspect than if they were hidden inside one streaming endpoint.
