---
title: A website for every adventure
date: 2026-09-01
summary: Travel planning has become one of my most useful agentic workflows. I build a website for each adventure and keep using it during the trip.
draft: true
---

I now make a website for every adventure and keep it open during the trip. Of everything I've built with agents, travel is the part that has most clearly become routine.

A trip produces a lot of loose information: places to compare, routes, the order of each day, and details I'll need again on the way out the door. Before the trip I'm asking which hike to pick. During it I'm asking where that hike starts and what else is on for the day.

A website gives all of that one place I can come back to. Since I started working with coding agents in December 2025, I've built one of these for nearly every trip.

The [Austria itinerary](https://github.com/aranlucas/vienna-travel) is one example. It puts maps, GPX hikes, weather, packing, and a timeline in the same app. Everything hangs off the trip itself: a place belongs to a day, a hike belongs to a route, and the rest is there to help me follow the plan.

Because each site covers one trip, it can focus on whatever that trip needs. A hiking trip needs route information. A trip built around an appointment needs the schedule and its supporting material close at hand.

## Research and the reference I carry

An itinerary involves two jobs: finding information, then making the parts I picked easy to use.

My private `trvl` project handles the first with a travel-search CLI and MCP server. It can search flights, hotels, ground transport, destinations, and trip plans, and an assistant can use those searches without them being tied to any one itinerary page. The [travel plugin](https://github.com/aranlucas/lucas-plugins/tree/main/plugins/travel) packages access for compatible clients.

`traverse`, another private project, covers trails and conditions. It has a web app, an API, and an asynchronous worker, which keeps browsing separate from the slower work of collecting trail reports. Picking a hike and waiting for reports to be processed are different kinds of interaction, so splitting them made sense.

These projects cover neighboring parts of planning, and nothing yet turns a search result into a finished trip website automatically. What links them is how I plan: research the options, decide what goes in the plan, then make the plan easy to look up.

The public Austria repository also separates itinerary information I'm happy to share from private trip admin. I can share a route or a packing list without publishing traveler details or booking references, and the site doesn't need everything I know about the trip.

## A trip with something to prepare for

[Boards & beyond](https://github.com/aranlucas/raleigh-travel) applies the same idea to an upcoming trip to Raleigh for pediatric dental oral boards. Its navigation has separate Trip and Study sections that link to each other where a day needs both. An itinerary entry links to a study session, and that session links back to the day and on to the next session.

That lets the timeline point to the material I need for an activity as well as tell me when the activity happens. The study plan and the travel plan share the same hours, and linking them works better than keeping two separate schedules.

The Raleigh trip is still ahead as I write this in late September, so it's an example of preparation. Building a site and using it throughout the trip is already how I travel.

What I care about is that I keep using the site after the planning conversation ends. I open it because I'm on the trip and need the plan, and that's where software built with an agent has been most useful to me.
