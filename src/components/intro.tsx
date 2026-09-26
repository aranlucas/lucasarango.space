import { Ridgeline } from "@/components/ridgeline";
import { TextLink } from "@/components/site-header";

export function Intro() {
  return (
    <section className="[&_p]:mb-4 [&_p]:text-pretty">
      <Ridgeline className="mb-5" />
      <h1 className="mb-6 text-display font-semibold tracking-tight">Hi, I’m Lucas.</h1>
      <p className="text-lede">
        I’m a software engineer in Seattle. I like making useful things, especially AI tools that
        help with everyday life.
      </p>
      <p>
        Over the past ten years, I’ve built products at Amazon, AWS, and DoorDash. Most recently, I
        prototyped and led engineering for the grocery agent in{" "}
        <TextLink href="https://about.doordash.com/en-us/news/ask-doordash">Ask DoorDash</TextLink>,
        launched in June 2026. It started with a grocery-shopping project I made for myself.
      </p>
      <p>
        I’m still building for fun: tools for groceries, workouts, travel, and thinking through
        ideas. Away from a keyboard, I like hiking and camping.
      </p>
    </section>
  );
}
