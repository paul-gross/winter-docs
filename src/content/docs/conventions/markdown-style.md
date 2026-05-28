---
title: Agent-Facing Markdown
description: How to write the markdown agents read — path notation, naming, and guides for READMEs, extension index.md files, and skills.
---

Most winter documentation is *agent-facing*: it is loaded into an agent's context and acts as runtime instruction, not just reference reading. That changes how it should be written — clarity, a single source of truth, and no duplication matter more than prose polish. winter-harness's meta layer ([`harness/`](https://github.com/paul-gross/winter-harness/tree/master/harness)) is the convention set for writing it.

## Principles

The [`harness/principles.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/principles.md) file states the core rules: write for the agent that will act on the text, keep each fact in exactly one place, link rather than restate, and prefer tables and short imperative statements over narrative.

## Path & reference notation

Winter uses a `<context>:<path>` prefix so a reference is unambiguous about which repo or branch a file lives in — `workspace:/CLAUDE.md`, `alpha:/app-web/...`, `winter-harness:/python/error-handling.md`. The conventions for these references live in [`harness/winter-references.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/winter-references.md). (See also the [glossary entry](/winter-docs/getting-started/glossary/#path-notation).)

## Naming

Agents, skills, and commands follow consistent naming so a prefix maps predictably to an extension (`wf-blizzard`, `wg-issue`, `wst-…`). The naming conventions are part of the harness meta layer.

## Writing guides

| Writing… | Read | Source |
|----------|------|--------|
| A README | the README guide | [`harness/writing-readme.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/writing-readme.md) |
| An extension `index.md` (the auto-loaded runtime surface) | the index guide | [`harness/writing-extension-index.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/writing-extension-index.md) |
| A skill (`SKILL.md`) | the skill guide | [`harness/writing-skill.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/writing-skill.md) |

A key distinction these guides draw: an extension's `index.md` is the runtime surface auto-loaded into agent context, while its `README.md` is for humans browsing the repo. They serve different readers and should not be the same file.

## Reviewing it

Agent-facing markdown has its own reviewer. After authoring or changing an agent, skill, command, `CLAUDE.md`, or `ai/` doc, the [`context-reviewer`](/winter-docs/conventions/agentic-patterns/) agent checks it against these conventions for clarity, single-source-of-truth, and non-duplication.

:::note[Canonical source]
[`winter-harness/harness/`](https://github.com/paul-gross/winter-harness/tree/master/harness) — start at [`index.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/index.md).
:::
