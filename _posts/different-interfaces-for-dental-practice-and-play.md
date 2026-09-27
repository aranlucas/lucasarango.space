---
title: Building custom apps for my girlfriend's oral boards
date: 2026-09-27
summary: My girlfriend is preparing for pediatric dental oral boards. I've been building her custom apps for studying, interview practice, and the trip around the exam—with a dental game along the way.
draft: true
---

My girlfriend is preparing for her pediatric dental oral boards, and I've been building her custom apps to help with the preparation. That is what connects the study reference, the little interview device, and the website for her exam trip. The dental game is part of that same personal collection, with a more playful purpose.

Working with coding agents has given me a way to turn that support into software. There is a specific person to build for and a specific event to prepare for. The question becomes what I can make that would be useful to her: somewhere to find material, a way to practice answering questions, or a plan that keeps the trip and studying together.

Those needs call for different kinds of apps. Looking something up and answering it aloud are different activities, even when they concern the same case.

## A place to study and a way to rehearse

The `oral-boards` app brings cases, an exam framework, resources, search, and a study plan into one place. It has its own copy of the reference-search corpus, so it can run independently of the larger agent platform it originally lived in.

That independence matters for a personal tool. The study app has a focused job, and changes elsewhere in my projects should not require bringing the whole platform along just to open it. The reference material is a snapshot that can be updated explicitly.

For answering questions, I built the [pediatric interviewer](https://github.com/aranlucas/pediatric-interviewer-esp32). It combines a small ESP32 touchscreen with a web client for setting up a case. The device runs a six-question practice session and shows a review afterward.

The two interfaces divide the work: the web page handles setup, while the device presents the interview. It is a different way to approach preparation from browsing notes, with a bounded sequence to work through.

The software can organize a session and offer feedback, but the clinical content still needs to be checked against authoritative references. What I am building for her is support for studying and rehearsing, not a replacement for the knowledge the boards are testing.

## Build around the trip, too

The exam also has a trip around it. [Boards & beyond](https://github.com/aranlucas/raleigh-travel) brings the Raleigh itinerary and study plan together. A session in the daily schedule links to its material, and the session page links back to the day and onward to what comes next.

I already make websites for my adventures and refer to them during the trip. Here, that habit becomes a way to support her preparation: the schedule can account for studying as well as getting around, and the relevant material has a place in the plan.

As I write this in late September, the trip is still ahead. The site is a preparation tool for now. I describe the broader travel workflow in [A website for every adventure](/blog/a-website-for-every-adventure).

## Something playful alongside the preparation

Little Smiles, in my private `cavity-game` repository, takes the same subject in a lighter direction. It is a small 3D dental clinic with fictional patients. Players move through an appointment, manage comfort and instrument heat, and collect stickers for completed visits.

The project includes the Blender models and export scripts alongside the browser game. Building it involves the appearance of the clinic as well as the interactions: approaching the chair, choosing an instrument, seeing a treatment stage progress, and returning to a saved visit.

Its anatomy and treatment sequence are deliberately simplified. It is a game, with its own purpose alongside the study tools.

Together, these projects are an example of what I like about building with agents: I can make software around someone I care about and something happening in her life. The scope can be as specific as this exam, this trip, or this little game.

The apps now give that effort a concrete form: a study reference, a practice session, a trip plan, and something to play. What matters next is which parts she finds useful and how I can adapt them around her. That is the point of making them custom.
