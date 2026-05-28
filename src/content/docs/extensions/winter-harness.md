---
title: winter-harness
description: The conventions layer — code, markdown, and process conventions plus reference exemplars.
---

**[winter-harness](https://github.com/paul-gross/winter-harness)** is the conventions layer. It is the single source of truth for *how* code and agent-facing documentation are written in a winter ecosystem, and for the process by which changes are delivered.

## What it contributes

winter-harness *is* its conventions — unusually, its content lives at the top of the repo (not under `ai/`), because the conventions are its public surface, addressed via the `winter-harness:` path notation. It is organised in three layers:

- **Meta** (`harness/`) — conventions for writing the agent-facing markdown of the ecosystem: READMEs, extension `index.md` files, path references, and agent / skill / command naming.
- **Code** (`python/`, `exemplars/`) — conventions for application code (domain modeling, error handling, dependency injection, the repository pattern, protocol conformance, subprocess use, logging, module layout, linting, typechecking, testing), each with a reference exemplar showing the expected shape.
- **Process** (`workflows/`) — the day-to-day delivery workflow: the worktree model, branch naming, push target, the rebase rule, and pre-push checks.

## When to adopt

Adopt winter-harness when you want a consistent, agent-legible code and documentation style across repos — especially Python projects, and any workspace where agents author the markdown that other agents read. It pairs naturally with [winter-workflow](/winter-docs/extensions/winter-workflow/): the harness defines the standards, the workflow's reviewers enforce them.

## How to configure

```toml
[[standalone_repository]]
name = "winter-harness"
url = "git@github.com:paul-gross/winter-harness.git"
path = ".winter/ext/harness"
```

It contributes no skills or agents of its own — it is a convention library. Reference its files by path notation in agent context, e.g. `winter-harness:/python/error-handling.md`.

## Key conventions

- Read the convention file that matches your change *before* writing code — `python/domain-modeling.md` for a new type, `python/error-handling.md` for anything that can fail, `python/repository-pattern.md` for external I/O, and so on.
- `CONTRIBUTING.md` governs commit format and voice rules; `workflows/feature-delivery.md` governs how a change lands.
- When a convention is wrong or stale, fix it where you find it — the harness is meant to be maintained as you work.

:::note[Canonical source]
[`winter-harness`](https://github.com/paul-gross/winter-harness) — start at [`index.md`](https://github.com/paul-gross/winter-harness/blob/master/index.md). The conventions are also rendered in [Conventions & Patterns](/winter-docs/conventions/).
:::
