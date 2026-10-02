import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { IdeaRoute } from "@/components/idea-route";
import { TextLink } from "@/components/site-header";

export function Intro() {
  return (
    <>
      <section className="portfolio-intro" aria-labelledby="intro-title">
        <div className="intro-copy">
          <h1 id="intro-title">
            Lucas
            <br />
            <span>Arango.</span>
          </h1>
          <p className="intro-identity">
            Software engineer.
            <br />
            Seattle, Washington.
          </p>
          <p className="intro-lede">
            I like making useful things, especially AI tools that help with everyday life.
          </p>
          <div className="intro-links">
            <Link href="#projects">
              Explore the work <ArrowDown aria-hidden="true" size={18} />
            </Link>
            <Link href="/resume">
              My experience <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
        <IdeaRoute />
      </section>
      <AboutLucas />
    </>
  );
}

function AboutLucas() {
  return (
    <section className="about-lucas" aria-labelledby="about-title">
      <h2 id="about-title">
        Useful things.
        <br />
        Complex systems.
        <br />
        <span>Room to play.</span>
      </h2>
      <div>
        <p>
          Hi, I’m Lucas. I’m a software engineer in Seattle. Over the past ten years, I’ve built
          products at Amazon, AWS, and DoorDash. Most recently, I prototyped and led engineering for
          the grocery agent in{" "}
          <TextLink href="https://about.doordash.com/en-us/news/ask-doordash">
            Ask DoorDash
          </TextLink>
          , launched in June 2026. It started with a grocery-shopping project I made for myself.
        </p>
        <p>
          I’m still building for fun: tools for groceries, workouts, travel, and thinking through
          ideas. Away from a keyboard, I like hiking and camping.
        </p>
      </div>
    </section>
  );
}
