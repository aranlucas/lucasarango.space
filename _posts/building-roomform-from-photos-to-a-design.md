---
title: Building Roomform from photos to a design
date: 2026-10-30
summary: Roomform turns room photos and product references into design ideas. Building it meant keeping generated images connected to their inputs, making uncertain geometry visible, and letting long-running work survive a page reload.
draft: true
---

A room redesign begins with a collection of imperfect information: a few photos, a sofa I like, maybe some measurements, and an idea of how I want the space to feel. An image generator can make a convincing picture from that material. The harder part is making the picture useful when I want to change an idea, compare it with the room, or understand what the generator had to guess.

I've been building [Roomform](https://github.com/aranlucas/ikea-interior-design), an interior design studio for that workflow. A room can hold photos, product references, measurements, and generated designs. I can redesign a photographed room, furnish an empty one, change finishes, work from a sketch, or start without a photo. Designs can be compared, saved, and refined with a brush edit.

![Roomform's photo view alongside redesign settings, room dimensions, and a brief.](/case-studies/roomform-studio.webp)

_A local Roomform session with example dimensions and a sample photo; no design was generated. Photo by Jarosław Ceborski, [CC0 via Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:Living_room_(Unsplash).jpg>)._

The parts I'm interested in are the boundaries between the inputs, the model's estimates, and the finished image. Those boundaries affect how much the result can actually tell me.

## A product size needs a room

A product page might say a sofa is 211 cm wide. That's useful, but the number alone doesn't tell the image model how much of a wall the sofa should occupy.

Roomform parses product dimensions and optional room measurements into scale guidance. For example, a 211 cm sofa against a roughly 420 cm wall should span about half of that wall. The guidance goes into the prompt alongside the reference images; the photo-based path can also run a vision pass to suggest geometry and placement before generating the design. The [scale-aware generation change](https://github.com/aranlucas/ikea-interior-design/pull/9) shows the difference between passing a size as text and asking for a proportion.

That is still guidance, not a constraint solver. The room measurements may be missing or wrong, the model's placement plan is an estimate, and the image generator may not follow either precisely. A plausible rendering isn't proof the sofa fits. I'd check the actual measurements before ordering it.

## Two ways to make a 3D guide

Photos can help with more than a single view. Roomform uses photo matching and AI-assisted layouts to build 3D representations, and the two approaches answer different questions.

The photo-matching path uses COLMAP to find shared visual features across overlapping photos and recover a sparse point cloud and camera positions. It runs on the CPU without an AI model. This can be a useful view into the available photo evidence, but blank walls and unseen areas leave gaps. The result has no known physical scale and isn't a furnished, textured model. If the photos don't share enough detail, they may not align; manually marking corresponding points can help but doesn't guarantee a reconstruction.

The AI-assisted path instead uses room photos to estimate an architectural layout and renders it as a block model. Walls, openings, and fixtures can be shown alongside the assumptions and photo evidence; inferred surfaces are distinguished visually. Even an element visible in a photo has an estimated position and size in this model. It isn't a measured survey, and this path doesn't recover camera poses or depth maps. The [project README at the revision I reviewed](https://github.com/aranlucas/ikea-interior-design/blob/14c48a7b112df8496f1b0dc0685dddc4b9eeb127/README.md) describes both paths and their limitations.

I like having those distinctions in the interface because the models fail differently. More overlapping photos might help the matching path; the AI layout can produce an estimate from fewer photos, but a complete-looking room can still contain invented or misplaced structure.

## Keep the guide with the result

For an AI-assisted layout, Roomform can capture a chosen 3D view and use it as a guide for generation. The captured view supplies the intended camera and layout; the original room photos supply appearance and evidence. Selected products, inspiration images, and an optional earlier design can add context. The prompt asks the image model to preserve the selected view, but that remains a request rather than a guarantee.

The [generation code](https://github.com/aranlucas/ikea-interior-design/blob/14c48a7b112df8496f1b0dc0685dddc4b9eeb127/src/lib/generation.server.ts) saves the guide image and a layout snapshot with the generated design. That means I can return to a design and inspect the guide and source evidence it used, even if the room is reconstructed again later. A capture tied to an outdated or replaced reconstruction has to be refreshed before a new generation.

This is a small form of provenance: the result keeps enough context to explain what was sent to the model. It doesn't establish that the generated image respected every input. The [guide-generation tests](https://github.com/aranlucas/ikea-interior-design/blob/14c48a7b112df8496f1b0dc0685dddc4b9eeb127/src/lib/room-guide-generation.test.ts) check input ordering, saved artifacts, and stale or invalid guides; they aren't a visual accuracy evaluation of live model output.

## A design takes longer than a page load

Generating an image or reconstructing a room can take longer than a browser request. Roomform stores job status so the client can poll and pick the work back up after a reload. A per-user lease prevents overlapping paid image generations. If the server restarts during a generation, the interrupted job is marked failed instead of silently retrying a paid request. The [background job change](https://github.com/aranlucas/ikea-interior-design/pull/4) documents that behavior and its single-replica assumption.

Reconstruction has its own recovery rules: cancelling stops the running process, a failed rebuild keeps the previous successful result, and changing the source photos marks that result outdated. The app needs to distinguish a saved result from a result that still describes the current inputs.

These mechanics aren't as visible as the image, but they shape the experience of using it. A person can leave the page and come back to a status rather than wonder whether pressing Generate again will start a second job.

## What the picture can and can't say

Roomform is useful for exploring possibilities: how a different finish might feel, whether a reference belongs in the room, or which view makes a design easier to discuss. The scale notes, 3D guide, and source photos give that exploration more context.

They don't turn a generated image into a floor plan or establish product fit. The repository also notes that automatic COLMAP reconstruction requires a separate server installation; its current Railway service configuration doesn't install it. The [source and local setup](https://github.com/aranlucas/ikea-interior-design) are available if you want to explore the implementation. Treat the output as a design idea, then measure the room before making a decision that depends on dimensions.
