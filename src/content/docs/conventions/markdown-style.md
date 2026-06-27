---
title: Agent-Facing Context
description: How Winter organizes the runtime context an agent discovers — CLAUDE.md, agents, skills, indexes, ai/ references, routing, tool affordances, and review conventions.
---

Most winter documentation is *agent-facing*: it is loaded into an agent's context and acts as runtime instruction, not reference reading. The question is not how the text reads to a human but what behavior it produces in a fresh-context agent acting on it.

This page covers the winter-specific artifact layer — how the winter ecosystem organizes agent-facing context so agents can discover and act on it. The universal evaluation principles ([Canon](/winter-docs/conventions/canon/)) are separate: they apply to any harness, not only winter.

## The runtime context system

An agent's effective context is not a single file. It is a system of discoverable artifacts that the agent traverses during execution. Winter organizes this system around several artifact kinds:

| Artifact | Role |
|----------|------|
| `CLAUDE.md` | Workspace entry point — always in context; routes to everything else via `@`-references and key tables |
| `ai/` directories | Per-repo documentation loaded on demand; the agent reads only what it needs for the task |
| Extension `index.md` | Auto-loaded runtime surface for a winter extension; describes its commands, agents, and conventions |
| Agent definitions | Role descriptions with tool grants, model tiers, and task scope |
| `SKILL.md` files | Declarative skill scripts invoked by slash commands |
| Routing tables | Tables in `CLAUDE.md` or index files that map topics to files — the mechanism of progressive disclosure |
| Tool affordances | The set of tools an agent has available, which shapes what context it needs |
| Review conventions | Per-reviewer criteria that determine what gets checked and how |

Each artifact kind has its own writing conventions at the winter-ecosystem layer. The universal evaluation principles ([Canon](/winter-docs/conventions/canon/)) sit above this layer and apply to all of them.

## Path notation

Winter uses a `<context>:<path>` prefix so a reference is unambiguous about which repo or branch a file lives in — `workspace:/CLAUDE.md`, `alpha:/app-web/...`, `winter-harness:/canon/`. The conventions for these references live in [`winter-harness`](https://github.com/paul-gross/winter-harness). (See also the [glossary entry](/winter-docs/getting-started/glossary/#path-notation).)

A logical prefix is preferred over a plain relative or absolute path because the on-disk location is not stable. Extensions can be installed into any directory the workspace chooses, which breaks relative path notation between files. Skills compound this — they are frequently copied or symlinked into place for compatibility with the surrounding code harness, so a fixed path does not survive the move either. Naming the logical context instead keeps the reference valid wherever the files land, and the notation resolves cleanly for an LLM, which maps the prefix to its directory from the workspace `CLAUDE.md` rather than needing a literal filesystem path.

## Naming

Agents, skills, and commands follow consistent naming so a prefix maps predictably to an extension (`wf-blizzard`, `wg-issue`, `wst-…`). These naming conventions are part of the winter-ecosystem markdown layer (`harness/`).

## Writing guides

| Writing… | Read | Source |
|----------|------|--------|
| A README | the README guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |
| An extension `index.md` (the auto-loaded runtime surface) | the index guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |
| A skill (`SKILL.md`) | the skill guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |

A key distinction these guides draw: an extension's `index.md` is the runtime surface auto-loaded into agent context, while its `README.md` is for humans browsing the repo. They serve different readers and should not be the same file.

## Reviewing agent-facing context

Agent-facing context has its own reviewer. After authoring or changing an agent, skill, command, `CLAUDE.md`, or `ai/` doc, the [`context-reviewer`](https://github.com/paul-gross/winter-workflow/blob/master/agents/context-reviewer.md) agent checks it against Canon principles and winter conventions for clarity, single-source-of-truth, and non-duplication.

:::note[Canonical source]
[`winter-harness:/canon/`](https://github.com/paul-gross/winter-harness/tree/master/canon) (universal Canon) and [`winter-harness`](https://github.com/paul-gross/winter-harness) (winter-ecosystem artifact guides) — start at each directory's `index.md`.
:::
