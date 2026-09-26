---
title: "An RFID pantry needs an outbox, not just a scanner"
date: 2026-09-25
summary: "Pantry Pulse connects an ESP32 RFID station to inventory and shopping tools, with persistent scan events and idempotent updates."
draft: true
repository: https://github.com/aranlucas/pantry-pulse
---

A pantry scanner has a deceptively small job: scan a tag, add or subtract one item. The awkward part comes after the scan. Wi-Fi can disappear. A request can reach the server while its response gets lost. The device can restart with a few changes still waiting to be sent.

Pantry Pulse connects an ESP32 RFID station to a Cloudflare Worker, a D1 inventory database, a household dashboard, and MCP tools. The most interesting part of the project is the agreement between the firmware and the database about what one scan means.

Each scan captures a tag, a consume-or-restock mode, and an event ID. That identity stays with the event through retries. A physical button changes the mode, while a short duplicate-scan window prevents a tag held near the reader from immediately becoming several changes. Debouncing handles the physical interaction; event identity handles the network interaction. Those solve different problems.

Before accepting a scan into its in-memory queue, the firmware writes the event to ESP32 nonvolatile storage. It checks both the returned write length and a readback of the stored value. On startup, it rebuilds the queue from those persisted slots and sorts by sequence number. The outbox has a deliberate limit of 24 events; when full, it reports that the scan was not accepted. That is a more useful failure mode than pretending to record an event that has nowhere to go. [Firmware implementation](https://github.com/aranlucas/pantry-pulse/blob/79c1e015fbf3bf1be8c558f020ad1da0167c5453/firmware/esp32-rfid/src/main.cpp)

Sending is a separate step. Successful responses remove the event. Network failures, rate limits, and server errors keep it in the queue with an increasing retry delay. Terminal rejections are dropped with local feedback. An unlinked tag, for example, needs somebody to connect it to an item; repeatedly sending the same request cannot fix that.

The server makes those retries safe. Its adjustment function looks up the event ID before changing inventory. If the event already exists, the item, delta, source, reason, and device must match the original operation. Reusing an ID for a different change is a conflict. A matching replay returns the current item with an explicit replay flag.

New events go through a database batch that records the event, applies the quantity change only while the event is unapplied, and marks it applied. There is another small but important detail in retention: old events become tombstones before their full activity records are deleted. Otherwise, cleaning up history could make an old retry look new again. [Inventory repository](https://github.com/aranlucas/pantry-pulse/blob/79c1e015fbf3bf1be8c558f020ad1da0167c5453/src/server/repository.ts)

The shopping list then becomes a projection of inventory. Items below their target quantity contribute the difference to the queue. There is no separate list counter that every scan also has to keep synchronized.

MCP exposes that same model through snapshot, export, adjustment, and catalog-linking tools. Write tools are registered only for write access, and adjustments ask callers to preserve event IDs across retries. The agent is another client of the inventory rules. [MCP tools](https://github.com/aranlucas/pantry-pulse/blob/79c1e015fbf3bf1be8c558f020ad1da0167c5453/src/server/mcp.ts)

This does not make the pantry an automatic source of physical truth. Missed scans still need correction, a full outbox needs attention, and the code alone does not establish hardware reliability. It does make the boundary explicit: once a scan is accepted locally, retries should preserve its identity all the way to the inventory change.
