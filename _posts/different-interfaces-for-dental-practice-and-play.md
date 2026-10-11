---
title: Building custom apps for my girlfriend's oral boards
date: 2026-09-27
summary: My girlfriend is preparing for pediatric dental oral boards. I've been
  building her custom apps for studying, interview practice, and the trip around
  the exam, plus a dental game and a local model experiment whose first
  evaluation gave me a useful negative result.
draft: false
---

My girlfriend is preparing for her pediatric dental oral boards, and I've been building her custom apps to help. That's what ties together the study reference, the little interview device, and the website for her exam trip. The dental game belongs to the same collection, just for fun.

Coding agents have given me a way to turn that support into software. I have one person to build for and one event to prepare for, so the question is what would actually help her: somewhere to find material, a way to practice answering questions, or a plan that keeps the trip and studying together.

Each of those needs a different kind of app. Looking something up and answering it out loud are different activities, even for the same case.

## A place to study and a way to rehearse

The `oral-boards` app puts cases, an exam framework, resources, search, and a study plan in one place. It has its own copy of the reference-search corpus, so it runs without the larger agent platform it started in.

For a personal tool, that independence helps. The study app has one job, and I don't want changes elsewhere in my projects to mean dragging the whole platform along just to open it. The reference material is a snapshot I update on purpose.

The app now makes the practice loop more concrete. A guided session reveals an answer and then a case change in stages. Mock sessions save the timer, place, and self-ratings; a completed review can start another round using cases marked for rework. Flashcard answers link back to the notes behind them, so a gap can turn into reading and then another attempt.

That loop has to survive leaving the page. Focused review preserves the drawn cards and their order, and the study-data screen exports browser progress, unfinished sessions, and saved-reading references as a backup. Restoring a backup previews what will be combined and protects a different unfinished local session from being silently replaced. Downloaded source documents and installed study notes also make a defined part of the reference library available offline.

For answering questions, I built the [pediatric interviewer](https://github.com/aranlucas/pediatric-interviewer-esp32). It pairs a small ESP32 touchscreen with a web client for setting up a case. The device runs a six-question practice session and shows a review at the end.

The web page handles setup and the device runs the interview. Compared with browsing notes, it gives her a fixed sequence to work through.

The software can organize a session and give feedback, but the clinical content still has to be checked against authoritative references. I'm building something to help her study and rehearse, and the knowledge the boards test is still hers to learn.

## Build around the trip, too

The exam comes with a trip. [Raleigh, together](https://github.com/aranlucas/raleigh-travel) keeps the October 2–6 itinerary and links study blocks to Oral Boards. The study content now has its own home; old study URLs on the trip site redirect there. The travel site stays focused on the daily plan, local outings, logistics, and print mode.

I already make websites for my trips and use them while I'm away. Here that habit helps her prepare, since the schedule can plan for studying as well as getting around, and the material has a place in the plan.

The planned dates have passed as of this October update. I can describe the preparation and the software changes without inferring an exam outcome. I describe the wider travel workflow in [A website for every adventure](/blog/a-website-for-every-adventure).

## Something playful alongside the preparation

Little Smiles, in the now-public [cavity-game repository](https://github.com/aranlucas/cavity-game), takes the same subject somewhere lighter. It's a small 3D dental clinic with fictional patients. Players go through an appointment, keep the patient comfortable, watch instrument heat, and collect stickers for finished visits.

The repository has the Blender models and export scripts next to the browser game. Building it meant working on how the clinic looks as well as how it plays: walking up to the chair, picking an instrument, watching a treatment stage progress, and coming back to a saved visit.

The anatomy and treatment steps are simplified on purpose. It's a game, and it isn't trying to be a study tool.

## Test the model before trusting the improvement

The [local study lab](https://github.com/aranlucas/dentistry-finetune) asks a narrower question: can a small LoRA fine-tune improve a small model on a fixed study task? Its first pilot gave each question the beginning of a source sentence and two excerpts. Success required the exact ending and the right citation, or abstention when the evidence was insufficient.

The [saved results](https://github.com/aranlucas/dentistry-finetune/blob/e4c73f0bcceb48759c1a16bdc5ddde9e5d2c6c0e/runs/results.json) are a negative result. On 24 held-out cases, deterministic lexical extraction met the contract on all 24. The base SmolLM2-135M model and the saved adapter met it on none. Validation loss fell, but the adapter's generated answers still failed the task.

The baseline had an advantage built into this narrow task: the question quoted the sentence prefix it needed to locate. That result measures exact extraction and the output contract. It does not measure clinical reasoning, paraphrased retrieval, or oral-board competence. Later Q&A experiments have their own comparisons, with clinical review still pending.

For the tools I'm building her, the lesson is practical. A study answer needs a source she can inspect, and a claimed model improvement needs an evaluation that matches the behavior it promises. Training a model is only useful if the resulting answers hold up.

These projects are a good example of what I like about building with agents. I can make software around someone I care about and something happening in her life, scoped as tightly as this exam, this trip, or this little game.

The collection gives her ways to look something up, answer it aloud, return to a weak case, and carry the plan along. Which parts she chooses to use is what should drive the next change. That is the reason to make the tools custom.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
