---
title: Canon
description: Selected highlights from the universal harness principles in winter-canon.
---

**Canon** is the separate [`winter-canon`](https://github.com/paul-gross/winter-canon) extension and repository. It
captures principles true of any agent-facing harness, regardless of the language, workflow, or agent product built on
top. These principles are not specific to winter's tooling; they describe what makes any agent-context system coherent
and evolvable.

Keeping Canon separate from winter-specific artifact guidance (agents, skills, `CLAUDE.md` conventions) makes it
composable: any principle can be adopted independently, and the principles remain stable even as winter's implementation
conventions evolve.

## Selected highlights

The five concepts below are highlights, not the complete Canon. See the
[`winter-canon` routing index](https://github.com/paul-gross/winter-canon/blob/master/index.md) for the full set of
rules and owner files.

**Progressive disclosure** — entry points surface only what an agent needs to navigate to the next layer; detail lives
at the leaves, not at the top. A `CLAUDE.md` should not contain every rule; it should route to the file that does. See
[`winter-canon:/progressive-disclosure.md`](https://github.com/paul-gross/winter-canon/blob/master/progressive-disclosure.md).

**Single source of truth** — every fact lives in exactly one place. Duplication creates drift; link, don't copy. When a
convention changes, update the one authoritative file and every reference to it remains valid. See the owning
[`winter-canon:/principles.md`](https://github.com/paul-gross/winter-canon/blob/master/principles.md) file
(`canon:one-owner` and `canon:point-dont-duplicate`).

**Facts versus methodology** — facts and invariants belong to the target that can keep them true; reusable operations
belong to the workflow product that defines them. A target may organize its facts under `context/`, and a methodology
product may expose operations under `methodology/`, but ownership comes from what the content describes rather than the
directory name. Skills and agents adapt a shared operation when multiple executor kinds plausibly need it, but may
remain self-contained when no credible second executor exists. See
[`winter-canon:/facts-vs-methodology.md`](https://github.com/paul-gross/winter-canon/blob/master/facts-vs-methodology.md).

**Behavioral evaluation** — evaluate agent-facing content by the behavior it produces, not by how it reads to a human.
The canonical evaluator for a piece of harness is a fresh-context agent instructed to act on it. Prose that seems clear
to the author may be ambiguous or contradictory when an agent follows it literally. See
[`winter-canon:/evaluating-harness-changes.md`](https://github.com/paul-gross/winter-canon/blob/master/evaluating-harness-changes.md).

**The four levers** — observability, testability, discoverability, and pluggability are the four structural properties
that compound agent productivity. See
[`winter-canon:/four-levers.md`](https://github.com/paul-gross/winter-canon/blob/master/four-levers.md).

## How to apply Canon

Canon is evaluated at the boundary between target-owned facts, reusable methodology, and the adapters that execute it.
winter-harness owns winter-ecosystem facts and defaults for feature delivery and artifact packaging; a methodology
product such as winter-workflow owns reusable operational procedures. When authoring agent-facing context, ask:

- Can a fresh-context agent find the fact it needs without reading every file? (progressive disclosure)
- Is this fact stated in exactly one place? (single source of truth)
- Does this document contain target-owned facts, reusable operations, or runtime-specific adapter wiring, and is it
  owned accordingly? (facts vs methodology)
- Would a fresh-context agent, given only this document, produce the behavior I expect? (behavioral evaluation)
- Does this system give agents visibility into state, checkable outputs, findable facts, and extensible hooks? (the four
  levers)

:::tip[Review it, don't just eyeball it] Behavioral evaluation cuts both ways: the surest way to apply Canon is to have
an agent act on the context, not to read it yourself. Utilize a **Context Review** agent that focuses specifically on
AI-facing context — including agents, skills, entry points, and `context/` or `methodology/` docs — and evaluates it
against these Canon principles. See the review loops in [winter-workflow](/winter-docs/examples/winter-workflow/). :::

:::note[Canonical source] [`winter-canon:/index.md`](https://github.com/paul-gross/winter-canon/blob/master/index.md) —
the separate Canon extension's routing index. :::
