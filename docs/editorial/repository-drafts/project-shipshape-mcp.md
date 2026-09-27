---
title: "Repository health needs an unknown state"
date: 2026-08-30
summary: "Shipshape turns GitHub evidence into a deterministic maintenance queue while keeping missing information separate from confirmed failures."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/shipshape-mcp
---

A repository health tool can make a convincing report from very little information. A missing response becomes a red warning. A successful request becomes a green badge. Put enough badges together and the result looks more certain than the evidence behind it.

The goal is to turn observable GitHub signals into a repeatable maintenance plan, preserving uncertainty when evidence is missing.

Shipshape MCP is a read-only repository maintenance server. It collects GitHub signals and turns them into readiness checks and a ranked action plan. The design choice I find most useful is that its domain model has room for uncertainty.

A check can pass, fail, be unknown, or be not applicable. Those states are not interchangeable. If an endpoint cannot establish whether a feature is enabled, the evaluator can preserve that uncertainty instead of claiming a defect or awarding a pass. The server's architecture explicitly describes unavailable GitHub feature endpoints as an example of this boundary. [Architecture](https://github.com/aranlucas/shipshape-mcp/blob/69b3e4746312b8be52fb25a2c557f7ca3c2ac8e5/docs/architecture.md)

Rules also have stable identifiers, categories, priorities, and score impacts. An evaluator supplies an observation, confidence, evidence, and possibly more specific remediation text. It does not get to quietly change the rule's weight. The scoring layer rebuilds incoming checks from the rule catalog before using them, so collection and policy remain separate concerns. [Rule catalog and check construction](https://github.com/aranlucas/shipshape-mcp/blob/69b3e4746312b8be52fb25a2c557f7ca3c2ac8e5/src/domain/rules.ts)

That separation becomes useful when multiple observations describe the same rule. Shipshape deduplicates them conservatively: a failure outranks an unknown result, which outranks a pass, which outranks not applicable. Equal states use confidence and then a stable lexical tie-break. Sorting provider responses differently should not reorder the final report or change which duplicate wins.

The score has a subtle interpretation. Failed checks spend their fixed impact. Unknown checks retain their weight but spend no points, while not-applicable checks leave the calculation. Consequently, a high numeric score can coexist with incomplete evidence. The response also includes observed impact, state counts, and confidence; an unknown applicable check prevents the aggregate from advertising high confidence. A client that displays only the number would throw away an important part of the result. [Scoring implementation](https://github.com/aranlucas/shipshape-mcp/blob/69b3e4746312b8be52fb25a2c557f7ca3c2ac8e5/src/domain/scoring.ts)

The action plan is more directly useful than a score alone. It includes failures and unknown checks, puts confirmed failures first, then orders by priority, impact, confidence, and stable rule ordering. A bounded output reports how many actions were omitted. That lets a caller distinguish a short maintenance queue from a truncated one.

There is a practical product tradeoff here. Fixed rules make results reproducible, but their priorities are still choices encoded by the project. A deterministic score is not an objective definition of a good repository. It is an inspectable policy that can be questioned, tested, and revised without asking a language model to invent a new rubric on every run.

MCP gives an assistant access to this report, but the assistant does not decide the underlying score. The server's stated boundary is public repositories and read-only GitHub requests; it does not clone or execute the repositories it evaluates. That scope keeps collection focused on observable maintenance signals.

The interesting output is therefore a set of claims with evidence and confidence, followed by a stable ordering of work. A useful repository review should be able to say both “this needs fixing” and “I could not determine this yet.” Shipshape keeps those statements distinct all the way through its scoring model.
