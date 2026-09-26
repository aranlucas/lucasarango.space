import { Ridgeline } from "@/components/ridgeline";

export function Intro() {
  return (
    <section className="[&_p]:mb-4 [&_p]:text-pretty">
      <Ridgeline className="mb-5" />
      <h1 className="mb-6 text-display font-semibold tracking-tight">Hi, I’m Lucas.</h1>
      <p className="text-lede">
        I’m a software engineer in Seattle. I’ve spent more than ten years building products at
        Amazon, AWS and DoorDash, where I pitched and led Ask DoorDash, the conversational shopping
        assistant we launched in June 2026.
      </p>
      <p>
        Building agents is also what I do for fun. I run a small fleet of personal ones: a grocery
        agent that shops my local Kroger, a fitness coach, and tools like a shared whiteboard where
        an AI sketches system designs with me. The grocery agent is where the idea for Ask DoorDash
        started.
      </p>
      <p>
        When I’m away from a keyboard I’m usually in the Cascades, camping or climbing, or out on a
        run. This site is where I write about what I’m building and what I learn from it.
      </p>
    </section>
  );
}
