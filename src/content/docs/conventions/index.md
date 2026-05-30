---
title: Conventions & Patterns
description: Winter's reusable conventions — code, agent-facing markdown, and the agentic development methodology.
---

Beyond the CLI and extensions, winter carries a body of reusable conventions: how code is written, how agent-facing documentation is written, and how agents actually develop software. These come from two of winter's [reference implementations](/winter-docs/examples/) — [winter-harness](/winter-docs/examples/winter-harness/) (the conventions) and [winter-workflow](/winter-docs/examples/winter-workflow/) (the methodology) — and are rendered here as a navigable reference.

- **[Python Conventions](/winter-docs/conventions/python/)** — domain modeling, error handling, dependency injection, the repository pattern, testing, linting, and typechecking.
- **[Agent-Facing Markdown](/winter-docs/conventions/markdown-style/)** — path notation, naming, and how to write READMEs, extension `index.md` files, and skills.
- **[Agentic Development Patterns](/winter-docs/conventions/agentic-patterns/)** — the agent roles and the blizzard / thaw / review loops that coordinate them.

Each page summarises the conventions and links the canonical source files in [`winter-harness`](https://github.com/paul-gross/winter-harness) and [`winter-workflow`](https://github.com/paul-gross/winter-workflow) rather than duplicating them — the source files are the single source of truth, and they are meant to be maintained as you work.
