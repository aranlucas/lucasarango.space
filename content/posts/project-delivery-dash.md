---
title: "Who gets to decide the race is over?"
date: 2026-09-25
summary: "Delivery Dash keeps arcade driving in the browser while the room owns objectives, scoring, and race deadlines."
draft: true
repository: https://github.com/aranlucas/delivery-dash
---

Delivery Dash is a browser racing game with a surprisingly useful distributed-systems question inside it: which decisions belong to the driver, and which belong to the room?

The game renders a coastal city with React Three Fiber. Players drive, drift, boost, and jump while a Cloudflare Durable Object coordinates their room. There are delivery races, timed delivery rounds, ordered checkpoint sprints, and free driving. Those modes share a world, but they cannot all share the same definition of progress.

The car controller runs locally. It integrates acceleration and braking, tracks boost and drift rewards, handles jumps, and updates the car's pose. The player does not wait for a server response before seeing the steering take effect. It also contains practical recovery logic: if a jump lands a car inside geometry, an unstick routine searches for nearby free space and nudges it toward that space. The [local driving controller](https://github.com/aranlucas/delivery-dash/blob/8b83670a563a6139991f4a1a3344d323e8f08d93/src/client/game/ownCarController.ts) is where those immediate physical and visual decisions live.

The room has a narrower responsibility. It receives positions, relays them to other players, and checks whether the player has reached the current objective. During a delivery race, reaching a pickup changes the active leg to drop-off; reaching the destination increments completed deliveries and advances to the next order. Checkpoint mode advances an index instead. Free Drive has no objective to score.

That rule selection lives in [a shared game-mode module](https://github.com/aranlucas/delivery-dash/blob/8b83670a563a6139991f4a1a3344d323e8f08d93/src/shared/gameModes.ts). Checkpoints are chosen from generated curbside stops, with a minimum distance between them, rather than being arbitrary coordinates placed independently of the city. This keeps the objective logic tied to places the world generator already knows about.

The timed mode makes authority especially visible. Rush Hour has a server deadline. The room schedules an alarm to finish the race, but the position handler checks the deadline too. A late position update cannot score just because the alarm has not run yet. The same handler checks height as well as horizontal distance, preventing a car on an elevated deck from collecting a ground-level target directly beneath it. These decisions are in the [room worker](https://github.com/aranlucas/delivery-dash/blob/8b83670a563a6139991f4a1a3344d323e8f08d93/src/worker/index.ts).

Finishing is a state transition, not just a banner. The room stores the finished phase and standings, broadcasts the result, and schedules a later return to the lobby. That reset clears readiness and objective progress so a rematch starts from a defined state. The server owns when the round changes phase even though each browser owns its immediate driving simulation.

There is an important limit to this split. The server accepts finite client-reported positions; it does not replay steering inputs through an authoritative physics simulation or establish that every reported movement was physically possible. Owning the score and deadline is therefore different from providing comprehensive cheat resistance. For this arcade project, the implementation favors a direct local driving loop and a smaller coordination protocol.

That tradeoff is the part I find worth documenting. Realtime multiplayer does not require every variable to have the same owner. It requires being precise about ownership, including the limits of what the server can verify from the information clients send it.
