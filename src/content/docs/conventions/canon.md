---
title: Canon
description: Universal harness principles — progressive disclosure, single source of truth, facts versus methodology, behavioral evaluation, and the four levers.
---

**Canon** is the layer of winter-harness that captures principles true of any agent-facing harness, regardless of the language, workflow, or agent product built on top. These principles are not specific to winter's tooling; they describe what makes any agent-context system coherent and evolvable.

Keeping Canon separate from winter-specific artifact guidance (agents, skills, `CLAUDE.md` conventions) makes it composable: any principle can be adopted independently, and the principles remain stable even as winter's implementation conventions evolve.

## Principles

Five principles form the Canon, each defined in full in [`winter-harness:/canon/`](https://github.com/paul-gross/winter-harness/tree/master/canon):

**Progressive disclosure** — entry points surface only what an agent needs to navigate to the next layer; detail lives at the leaves, not at the top. A `CLAUDE.md` should not contain every rule; it should route to the file that does. See [`canon/progressive-disclosure.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/progressive-disclosure.md).

**Single source of truth** — every fact lives in exactly one place. Duplication creates drift; link, don't copy. When a convention changes, update the one authoritative file and every reference to it remains valid. See [`canon/principles.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/principles.md#point-dont-duplicate).

**Facts versus methodology** — facts belong in the project's owned harness; methodology belongs in the workflow or tool. A methodology that embeds facts it cannot control cannot be validated or reused across projects. See [`canon/facts-vs-methodology.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/facts-vs-methodology.md).

**Behavioral evaluation** — evaluate agent-facing content by the behavior it produces, not by how it reads to a human. The canonical evaluator for a piece of harness is a fresh-context agent instructed to act on it. Prose that seems clear to the author may be ambiguous or contradictory when an agent follows it literally. See [`canon/evaluating-harness-changes.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/evaluating-harness-changes.md).

**The four levers** — observability, testability, discoverability, and pluggability are the four structural properties that compound agent productivity. See [`canon/four-levers.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/four-levers.md).

## How to apply Canon

Canon is evaluated at the boundary between generic tools and project-owned facts. When authoring agent-facing context, ask:

- Can a fresh-context agent find the fact it needs without reading every file? (progressive disclosure)
- Is this fact stated in exactly one place? (single source of truth)
- Does this document contain facts that belong in the project's harness, or methodology that belongs in the workflow? (facts vs methodology)
- Would a fresh-context agent, given only this document, produce the behavior I expect? (behavioral evaluation)
- Does this system give agents visibility into state, checkable outputs, findable facts, and extensible hooks? (the four levers)

:::tip[Review it, don't just eyeball it]
Behavioral evaluation cuts both ways: the surest way to apply Canon is to have an agent act on the context, not to read it yourself. Utilize a **Context Review** agent that focuses specifically on AI-facing context — agents, skills, `CLAUDE.md`, and `context/` docs — and evaluates it against these Canon principles. See the review loops in [winter-workflow](/winter-docs/examples/winter-workflow/).
:::

:::note[Canonical source]
[`winter-harness:/canon/`](https://github.com/paul-gross/winter-harness/tree/master/canon) — each principle has its own file; start at the directory's `index.md` for the full Canon.
:::
