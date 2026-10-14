import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { SectionHeading } from "@/components/section-heading";

test("SectionHeading renders its heading and aside", () => {
  render(<SectionHeading aside={<span>3 entries</span>}>Recent writing</SectionHeading>);

  expect(screen.getByRole("heading", { level: 2, name: "Recent writing" })).toBeDefined();
  expect(screen.getByText("3 entries")).toBeDefined();
});
