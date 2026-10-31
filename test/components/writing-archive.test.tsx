import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { WritingArchive } from "@/components/writing-archive";
import type { Post } from "@/interfaces/post";

const posts: Post[] = [
  {
    slug: "groceries",
    title: "Shopping",
    summary: "A weekly task",
    content: "Kroger cart",
    date: "2026-10-01",
    readingMinutes: 2,
    draft: false,
  },
  {
    slug: "canvas",
    title: "Whiteboard",
    summary: "Shared design",
    content: "Systems",
    date: "2026-09-01",
    readingMinutes: 3,
    draft: false,
  },
];

test("searches post bodies and can restore the full archive after no results", () => {
  render(<WritingArchive posts={posts} />);

  fireEvent.change(screen.getByRole("searchbox", { name: "Search writing" }), {
    target: { value: "Kroger" },
  });
  expect(screen.getByRole("link", { name: /Shopping/u })).toBeDefined();
  expect(screen.queryByRole("link", { name: /Whiteboard/u })).toBeNull();

  fireEvent.change(screen.getByRole("searchbox", { name: "Search writing" }), {
    target: { value: "nothingmatches" },
  });
  expect(screen.getByText(/No posts matched/u)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "browse all writing" }));
  expect(screen.getByRole("link", { name: /Whiteboard/u })).toBeDefined();
});
