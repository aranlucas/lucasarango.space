import { Ridgeline } from "@/components/ridgeline";
import { TextLink } from "@/components/site-header";

export function Intro() {
  return (
    <section className="[&_p]:mb-4 [&_p]:text-pretty">
      <Ridgeline className="mb-5" />
      <h1 className="mb-6 text-display font-semibold tracking-tight">Hi, I’m Lucas.</h1>
      <p className="text-lede">
        I’m a software engineer in Seattle. I build AI products and the systems that make them
        reliable, from the first prototype to the work of running them in production.
      </p>
      <p>
        I’ve spent more than ten years at Amazon, AWS, and DoorDash. Most recently, I prototyped and
        led engineering for the grocery agent in{" "}
        <TextLink href="https://about.doordash.com/en-us/news/ask-doordash">Ask DoorDash</TextLink>,
        launched in June 2026, and worked on the shared agent platform behind it.
      </p>
      <p>
        Building agents is also what I do for fun. My own grocery-shopping agent inspired that
        pitch. These days my personal projects span groceries, fitness, travel, and a whiteboard
        where an AI sketches system designs with me. Away from a keyboard, I like hiking and
        camping.
      </p>
    </section>
  );
}
