---
title: "Building a little dental clinic to play in"
date: 2026-09-07
summary: "Little Smiles turns a fictional appointment into a small 3D game with a treatment sequence and persistent progress."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/cavity-game
---

A small game needs more than a scene to look at. It needs actions that lead somewhere, feedback that makes those actions understandable, and a reason to return after the first interaction.

The goal is to build a complete, gentle single-player appointment loop inside a navigable 3D dental clinic.

The private `cavity-game` repository calls the game Little Smiles. Players move through a clinic and complete inspection, cleaning, repair, filling, and curing stages for fictional patients. Comfort and instrument heat affect the interaction, and finished visits earn stickers.

The repository includes Blender sources and export scripts for the stylized patient and equipment, alongside the browser game. Progress is saved locally, and returning to the page resumes the current visit. The README explicitly describes the anatomy and treatment as fictional and simplified.

That makes the project a useful place to document several kinds of agent-assisted work together: scene construction, asset production, interaction, and the state needed to turn a demonstration into a game.

The repository contains a complete documented play loop and editable asset sources. It does not establish clinical training value or player enjoyment, and I have not playtested it for this writing pass.

The personal result needs the motivation for the game and an account of someone playing it, including what was confusing or delightful.
