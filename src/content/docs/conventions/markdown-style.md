---
title: Agent-Facing Context
description: How Winter organizes target-owned context, reusable methodology, adapters, indexes, routing, and review conventions.
---

Most winter documentation is *agent-facing*: it is loaded into an agent's context and acts as runtime instruction, not reference reading. The question is not how the text reads to a human but what behavior it produces in a fresh-context agent acting on it.

This page covers the winter-specific artifact layer — how the winter ecosystem organizes agent-facing context so agents can discover and act on it. The universal evaluation principles ([Canon](/winter-docs/conventions/canon/)) are separate: they apply to any harness, not only winter.

## The runtime context system

An agent's effective context is not a single file. It is a system of discoverable artifacts that the agent traverses during execution. Common winter artifacts include:

| Artifact | Role |
|----------|------|
| `AGENTS.md` / `CLAUDE.md` | Workspace entry points that route agents to the context relevant to their task |
| Target-owned documentation | Facts and invariants about a repository or workspace, often organized under `context/` |
| Reusable methodology | Operations owned by a methodology product; winter-workflow organizes these under `methodology/` |
| Extension `index.md` | Auto-loaded runtime surface for an extension; routes to its contributions and universally required operating facts |
| Agent definitions | Canonical isolated-runtime adapters that `winter ws init` projects into per-harness copies |
| `SKILL.md` files | Session adapters; `winter ws init` symlinks them for Claude Code and Codex and copies them for OpenCode |
| Routing tables | Tables in `CLAUDE.md` or index files that map topics to files — the mechanism of progressive disclosure |

Directory names express ownership; they do not impose a layout on every repository. A target can declare facts wherever its harness routes agents to them. A methodology product can give reusable operations a caller-independent home; winter-workflow uses `methodology/` for that purpose. Skills and agents then adapt those operations rather than becoming second owners of their steps.

winter-harness owns winter-ecosystem facts and defaults about feature delivery and artifact packaging, including how artifacts are shaped, projected, named, and wired together. A workflow product such as winter-workflow owns reusable operational procedures. This boundary does not exclude methodology-related policy facts from the harness; it keeps reusable execution steps with the workflow product. The separate [Canon](/winter-docs/conventions/canon/) defines the universal evaluation principles that apply to both layers.

Use the **plausible-second-executor test** when packaging an operation: if a concrete executor with different invocation or runtime semantics could perform the same steps from the same inputs, give the method one caller-neutral owner behind adapters; otherwise keep the skill or agent self-contained. The selection rule lives in [`winter-canon:/facts-vs-methodology.md`](https://github.com/paul-gross/winter-canon/blob/master/facts-vs-methodology.md); the [`winter-harness` methodology packaging convention](https://github.com/paul-gross/winter-harness/blob/master/agent-context/methodology-packaging.md) defines winter's realization after that selection.

## Path notation

Winter uses a `<context>:<path>` prefix so a reference is unambiguous about which repo or branch a file lives in — `workspace:/CLAUDE.md`, `alpha:/app-web/...`, `winter-canon:/principles.md`. The conventions for these references live in [`winter-harness`](https://github.com/paul-gross/winter-harness). (See also the [glossary entry](/winter-docs/getting-started/glossary/#path-notation).)

A logical prefix is preferred over a plain relative or absolute path because the on-disk location is not stable. Extensions can be installed into any directory the workspace chooses, and `winter ws init` projects skills and agents into each harness's native location. Naming the logical context keeps references valid wherever those artifacts land.

## Naming

Agents, skills, and commands follow consistent naming so installed artifacts map predictably to an extension (`wf-glacier`, `wg-issue`, `wst-…`). Projected agent identity differs by harness: Claude Code and Codex invoke the unprefixed canonical agent name, while OpenCode invokes the prefixed projected filename. These naming conventions are part of the winter-ecosystem agent-context domain (`agent-context/`).

## Writing guides

| Writing… | Read | Source |
|----------|------|--------|
| A README | the README guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |
| An extension `index.md` (the auto-loaded runtime surface) | the index guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |
| A skill (`SKILL.md`) | the skill guide | [`winter-harness`](https://github.com/paul-gross/winter-harness) |
| An agent definition | the agent and projection guides | [`winter-harness`](https://github.com/paul-gross/winter-harness) |

A key distinction these guides draw: an extension's `index.md` is the runtime surface auto-loaded into agent context, while its `README.md` is for humans browsing the repo. They serve different readers and should not be the same file.

## Reviewing agent-facing context

Agent-facing context has its own reviewer. After authoring or changing an agent, skill, command, entry point, or agent-facing document under `context/` or `methodology/`, the [`context-reviewer`](https://github.com/paul-gross/winter-workflow/blob/master/agents/context-reviewer.md) checks it against Canon principles and winter conventions for clarity, single-source-of-truth, and non-duplication.

:::note[Canonical source]
[`winter-canon:/index.md`](https://github.com/paul-gross/winter-canon/blob/master/index.md) owns the universal Canon; [`winter-harness`](https://github.com/paul-gross/winter-harness) owns winter-ecosystem feature-delivery and artifact-packaging facts and defaults; [`winter-workflow`](https://github.com/paul-gross/winter-workflow) owns reusable operational procedures.
:::
