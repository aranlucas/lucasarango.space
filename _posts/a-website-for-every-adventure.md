---
title: A website for every adventure
date: 2026-09-01
summary: Travel planning has become one of my most useful agentic workflows. I build a website for each adventure and keep using it during the trip.
draft: true
---

I now make a website for every adventure and reference it during the trip. Of everything I have been building with agents, travel is one of the areas that has most clearly become part of my routine.

A trip produces information in several shapes. There are places to compare, routes to understand, days to arrange, and details to find again when it is time to leave. Before the trip, the question might be which hike to choose. During it, the question is more likely to be where that hike starts and what else is planned for the day.

A website gives that information a shape I can return to. Since I began working with coding agents in December 2025, making a dedicated interface for one adventure has become something I do repeatedly.

The [Austria itinerary](https://github.com/aranlucas/vienna-travel) is one example. It brings maps, GPX hikes, weather, packing, and a timeline into the same application. The trip is the organizing unit: a place belongs to a day, a hike belongs to a route, and the surrounding details are useful because they help follow the plan.

That specificity is part of the appeal. An itinerary for one adventure can give its attention to the information that matters there. A hiking trip benefits from route information. A trip built around an appointment needs the schedule and its supporting material close at hand.

## Research and the reference I carry

There are two different jobs around an itinerary: finding the information and making the selected information easy to use.

My private `trvl` project explores the first through a travel-search CLI and MCP server. It exposes searches for flights, hotels, ground transport, destinations, and trip plans. An assistant can use those capabilities without the search integration being tied to one particular itinerary page. The [travel plugin](https://github.com/aranlucas/lucas-plugins/tree/main/plugins/travel) packages access for compatible clients.

`traverse`, another private project, focuses on trails and conditions. Its web application, API, and asynchronous worker separate browsing from the slower work of collecting reports. That is a useful division for research: selecting a hike and waiting for source material to be processed are different interactions.

These projects address adjacent parts of planning. They are not evidence of an automatic pipeline that takes a search result all the way to a finished trip website. The useful connection is the activity they support: research possibilities, decide what belongs in the plan, then make that plan easy to consult.

The public Austria repository also keeps a boundary between shareable itinerary information and private trip administration. A route or packing list can be useful to share without publishing traveler details or booking references. A trip website does not need every piece of information I hold about the trip.

## A trip with something to prepare for

[Boards & beyond](https://github.com/aranlucas/raleigh-travel) applies the same idea to an upcoming Raleigh trip for pediatric dental oral boards. Its navigation separates Trip and Study, then connects them where the day requires it. An itinerary entry links to a study session; that session links back to the day and onward to the next one.

That changes what a timeline can do. It can point to the material needed for an activity as well as tell me when the activity happens. A study plan and a travel plan share the same hours, so making the relationship navigable is more useful than maintaining two disconnected schedules.

The Raleigh trip is still ahead as I write this in late September. It is an example of preparation, while the broader habit—building sites and referring to them during adventures—is already part of how I travel.

The result I care about is that continued use. The website remains useful after the planning conversation ends. It becomes something I open because I am on the trip and need the plan, which is a concrete place for agent-assisted software to earn its keep.
