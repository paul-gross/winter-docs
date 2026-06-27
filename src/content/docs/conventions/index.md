---
title: Conventions & Patterns
description: Winter's reusable conventions — Canon principles, agent-facing context design, and agentic development patterns.
---

Beyond the CLI and extensions, winter carries a body of reusable conventions for designing agent-context systems and agentic development workflows. These come from two of winter's [reference implementations](/winter-docs/examples/) — [winter-harness](/winter-docs/examples/winter-harness/) (the conventions) and [winter-workflow](/winter-docs/examples/winter-workflow/) (the methodology) — and are organized into three conceptual areas.

- **[Canon](/winter-docs/conventions/canon/)** — universal harness principles that remain valid across repositories, languages, workflows, and agent products: progressive disclosure, single source of truth, facts versus methodology, behavioral evaluation, and the four levers.
- **[Agent-Facing Context](/winter-docs/conventions/markdown-style/)** — how the winter ecosystem organizes the runtime context an agent discovers, including `CLAUDE.md`, agents, skills, indexes, `context/` references, routing, tool affordances, and review conventions.
- **[Agentic Development Patterns](/winter-docs/conventions/agentic-patterns/)** — implementation-independent design patterns: dependency inversion, single responsibility, open/closed context design, context derivation, derived delivery policy, and closed feedback loops.

Each page links canonical source files in [`winter-harness`](https://github.com/paul-gross/winter-harness) and [`winter-workflow`](https://github.com/paul-gross/winter-workflow) rather than duplicating them — the source files are the single source of truth, and they are meant to be maintained as you work.
