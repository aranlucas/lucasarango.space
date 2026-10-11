---
title: A website for every adventure
date: 2026-09-01
summary: Travel planning has become one of my most useful agentic workflows. I
  build a website for each adventure, with one trip model behind its maps,
  timeline, packing list, and read-only assistant tools.
draft: false
---

I now make a website for every adventure and keep it open during the trip. Of everything I've built with agents, travel is the part that has most clearly become routine.

A trip produces a lot of loose information: places to compare, routes, the order of each day, and details I'll need again on the way out the door. Before the trip I'm asking which hike to pick. During it I'm asking where that hike starts and what else is on for the day.

A website gives all of that one place I can come back to. Since I started working with coding agents in December 2025, I've built one of these for nearly every trip.

The [Austria itinerary](https://github.com/aranlucas/vienna-travel) is one example. It puts maps, GPX hikes, weather, packing, and a timeline in the same app. Everything hangs off the trip itself: a place belongs to a day, a hike belongs to a route, and the rest is there to help me follow the plan.

The [trip data](https://github.com/aranlucas/vienna-travel/tree/80e35abd95c26ae88a9ce845a7d147da37604237/lib/data) lives in separate records for the itinerary, transport, stays, hikes, packing, and logistics. The timeline is derived from those records. Changing a day's plan should update every view that uses it, rather than leave me comparing two schedules that drifted apart.

The hiking data has distinctions that a polished map can hide. The three-lake loop uses a verified GPX track; the Seebensee file is labeled as a separate valley-start reference. Distance and elevation are only useful when I know which route they describe. Weather enrichment has a similar limit: when a forecast is unavailable, the site keeps seasonal guidance instead of presenting it as a live forecast.

Because each site covers one trip, it can focus on whatever that trip needs. A hiking trip needs route information. A trip built around an appointment needs the schedule and its supporting material close at hand.

The same assembled trip is available through [read-only WebMCP tools](https://github.com/aranlucas/vienna-travel/blob/80e35abd95c26ae88a9ce845a7d147da37604237/components/webmcp/TripWebMcp.tsx). A compatible browser agent can read day plans or search the itinerary that I see. It gets a way to answer questions about my plan without becoming a second place to maintain it.

## Research and the reference I carry

An itinerary involves two jobs: finding information, then making the parts I picked easy to use.

My private `trvl` project handles the first with a travel-search CLI and MCP server. It can search flights, hotels, ground transport, destinations, and trip plans, and an assistant can use those searches without them being tied to any one itinerary page. The [travel plugin](https://github.com/aranlucas/lucas-plugins/tree/ad878d3de66db166afa644aebff94c231fe398cd/plugins/travel) packages access for compatible clients.

`traverse`, another private project, covers trails and conditions. It has a web app, an API, and an asynchronous worker, which keeps browsing separate from the slower work of collecting trail reports. Picking a hike and waiting for reports to be processed are different kinds of interaction, so splitting them made sense.

These projects cover neighboring parts of planning, and nothing yet turns a search result into a finished trip website automatically. What links them is how I plan: research the options, decide what goes in the plan, then make the plan easy to look up.

The public Austria repository also separates itinerary information I'm happy to share from private trip admin. I can share a route or a packing list without publishing traveler details or booking references, and the site doesn't need everything I know about the trip.

## Smaller tools for specific planning decisions

Two newer experiments make the scope even tighter. [Trailbraid](https://github.com/aranlucas/trailbraid) compares GPX geometry and elevation profiles on one coordinate canvas without a map service. Track segments stay separate and missing elevation stays unknown. It helps inspect a route file; its decorative contours do not represent terrain.

[Leavewell](https://github.com/aranlucas/leavewell-departure-planner) works backward from an arrival deadline using entered task durations and dated transit departures. Its seeded samples let me compare assumptions, including what happens if several steps are slow together. The displayed coverage describes that bounded model, rather than a calibrated prediction that I'll catch a real flight.

Both are local prototypes with synthetic examples. They explore decisions an itinerary needs to explain: which route am I comparing, and which assumption determines when I leave?

## A trip with something to prepare for

[Raleigh, together](https://github.com/aranlucas/raleigh-travel) applies the same idea to the October 2–6, 2026 pediatric dental oral boards itinerary. The trip site links study blocks to the separate Oral Boards app. Its old `/study` routes redirect there, while the travel app keeps the daily schedule, places to explore, exam logistics, and printable recap.

That lets the timeline point to the material I need for an activity as well as tell me when the activity happens. The study plan and the travel plan share the same hours, and linking them works better than keeping two separate schedules.

The itinerary dates have passed as of this October update. The repository shows the preparation and the later separation of study material; it does not tell me how the exam or trip went. The wider habit of building a site and using it throughout a trip is already part of how I travel.

What I care about is that I keep using the site after the planning conversation ends. I open it because I'm on the trip and need the plan, and that's where software built with an agent has been most useful to me.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
