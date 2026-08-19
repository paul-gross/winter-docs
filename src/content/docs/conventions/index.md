---
title: Conventions & Patterns
description: Winter's reusable conventions — Canon principles, agent-facing context design, and agentic development patterns.
---

Beyond the CLI and extensions, winter carries a body of reusable conventions for designing agent-context systems and
agentic development workflows. The separate [`winter-canon`](https://github.com/paul-gross/winter-canon) repository owns
universal principles; [winter-context](/winter-docs/examples/winter-context/) owns winter-ecosystem facts and defaults
for feature delivery and artifact packaging; and [winter-workflow](/winter-docs/examples/winter-workflow/) owns reusable
operational procedures. Target repositories and workspaces remain the authority for facts and invariants about
themselves.

- **[Canon](/winter-docs/conventions/canon/)** — selected highlights from universal harness principles that remain valid
  across repositories, languages, workflows, and agent products; the canonical routing index lists the complete set.
- **[Agent-Facing Context](/winter-docs/conventions/markdown-style/)** — how the winter ecosystem separates target-owned
  facts, reusable methodology, runtime adapters, and routing.
- **[Agentic Development Patterns](/winter-docs/conventions/agentic-patterns/)** — implementation-independent design
  patterns: dependency inversion, single responsibility, open/closed context design, context derivation, derived
  delivery policy, and closed feedback loops.

Each page links canonical source files rather than duplicating them:
[`winter-canon`](https://github.com/paul-gross/winter-canon) for universal principles,
[`winter-context`](https://github.com/paul-gross/winter-context) for winter's feature-delivery and artifact-packaging
facts and defaults, and [`winter-workflow`](https://github.com/paul-gross/winter-workflow) for reusable procedures. The
target's own context remains the source of truth for facts about that target.
