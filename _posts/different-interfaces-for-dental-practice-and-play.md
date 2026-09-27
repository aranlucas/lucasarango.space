---
title: Building custom apps for my girlfriend's oral boards
date: 2026-09-27
summary: My girlfriend is preparing for pediatric dental oral boards. I've been
  building her custom apps for studying, interview practice, and the trip around
  the exam, plus a dental game along the way.
draft: false
---
My girlfriend is preparing for her pediatric dental oral boards, and I've been building her custom apps to help. That's what ties together the study reference, the little interview device, and the website for her exam trip. The dental game belongs to the same collection, just for fun.

Coding agents have given me a way to turn that support into software. I have one person to build for and one event to prepare for, so the question is what would actually help her: somewhere to find material, a way to practice answering questions, or a plan that keeps the trip and studying together.

Each of those needs a different kind of app. Looking something up and answering it out loud are different activities, even for the same case.

## A place to study and a way to rehearse

The `oral-boards` app puts cases, an exam framework, resources, search, and a study plan in one place. It has its own copy of the reference-search corpus, so it runs without the larger agent platform it started in.

For a personal tool, that independence helps. The study app has one job, and I don't want changes elsewhere in my projects to mean dragging the whole platform along just to open it. The reference material is a snapshot I update on purpose.

For answering questions, I built the [pediatric interviewer](https://github.com/aranlucas/pediatric-interviewer-esp32). It pairs a small ESP32 touchscreen with a web client for setting up a case. The device runs a six-question practice session and shows a review at the end.

The web page handles setup and the device runs the interview. Compared with browsing notes, it gives her a fixed sequence to work through.

The software can organize a session and give feedback, but the clinical content still has to be checked against authoritative references. I'm building something to help her study and rehearse, and the knowledge the boards test is still hers to learn.

## Build around the trip, too

The exam comes with a trip. [Boards & beyond](https://github.com/aranlucas/raleigh-travel) combines the Raleigh itinerary with her study plan. A session in the daily schedule links to its material, and the session page links back to the day and on to what's next.

I already make websites for my trips and use them while I'm away. Here that habit helps her prepare, since the schedule can plan for studying as well as getting around, and the material has a place in the plan.

As I write this in late September, the trip is still ahead, so for now the site is a preparation tool. I describe the wider travel workflow in [A website for every adventure](/blog/a-website-for-every-adventure).

## Something playful alongside the preparation

Little Smiles, in my private `cavity-game` repository, takes the same subject somewhere lighter. It's a small 3D dental clinic with fictional patients. Players go through an appointment, keep the patient comfortable, watch instrument heat, and collect stickers for finished visits.

The repository has the Blender models and export scripts next to the browser game. Building it meant working on how the clinic looks as well as how it plays: walking up to the chair, picking an instrument, watching a treatment stage progress, and coming back to a saved visit.

The anatomy and treatment steps are simplified on purpose. It's a game, and it isn't trying to be a study tool.

These projects are a good example of what I like about building with agents. I can make software around someone I care about and something happening in her life, scoped as tightly as this exam, this trip, or this little game.

She now has a study reference, a practice session, a trip plan, and something to play. Next I want to find out which parts she actually uses and adjust them for her, since that's the reason to make them custom.