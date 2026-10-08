"use client";

import dynamic from "next/dynamic";

// Keep the message server-rendered while splitting the game UI from other routes.
export const LostGameLoader = dynamic(() =>
  import("./lost-game").then((module) => module.LostGame),
);
