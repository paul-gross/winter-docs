---
title: winter-harness
description: The conventions layer — code, markdown, and process conventions plus reference exemplars.
---

**[winter-harness](https://github.com/paul-gross/winter-harness)** is the conventions layer. It is the single source of truth for *how* code and agent-facing documentation are written across the winter ecosystem — winter and all its extensions — and for the process by which changes are delivered.

It's grouped under [Examples](/winter-docs/examples/) because winter keeps the harness a swappable component. Today it encodes the conventions for winter and its extensions specifically — it is not a general-purpose convention library — but you reference it directly by path notation, and you can fork it as the starting point for a harness of your own.

## What it contributes

winter-harness *is* its conventions — unusually, its content lives at the top of the repo (not under `ai/`), because the conventions are its public surface, addressed via the `winter-harness:` path notation. It is organised in four layers:

- **Canon** (`canon/`) — the universal, enforceable substrate true of any harness: cross-cutting authoring principles, the facts/methodology split, the harness-change eval, and the four levers. Self-contained — it depends on nothing else.
- **Markdown** (`harness/`) — winter-ecosystem conventions for writing the agent-facing markdown of the ecosystem: READMEs, extension `index.md` files, path references, and agent / skill / command naming. Rests on the Canon.
- **Code** (`python/`, `exemplars/`) — conventions for application code (domain modeling, error handling, dependency injection, the repository pattern, protocol conformance, subprocess use, logging, module layout, linting, typechecking, testing), each with a reference exemplar showing the expected shape.
- **Process** (`workflows/`) — the day-to-day delivery workflow: the worktree model, branch naming, push target, the rebase rule, and pre-push checks.

## What to take from it

Its conventions target winter and its extensions today, so what transfers to other projects is the *shape*, not the facts. If you fork it, keep the Canon (the universal authoring principles and the facts/methodology split) and the winter-ecosystem markdown structure (READMEs, extension `index.md` rules, convention-per-file), and supply the code and domain facts your own repos need — especially for Python projects and any workspace where agents author the markdown other agents read. It pairs with [winter-workflow](/winter-docs/examples/winter-workflow/) by design — the harness holds the *facts* (what's true), a workflow's reviewers hold the *methodology* (how they review), and the reviewers read the harness rather than carry a copy (see [`canon/facts-vs-methodology.md`](https://github.com/paul-gross/winter-harness/blob/master/canon/facts-vs-methodology.md)).

## How it's wired in

As a real standalone repo, declared in `.winter/config.toml` like any other — examples are installed; only how the docs frame them differs:

```toml
[[standalone_repository]]
name = "winter-harness"
url = "git@github.com:paul-gross/winter-harness.git"
path = ".winter/ext/harness"
```

It contributes no skills or agents of its own — it is a convention library. Reference its files by path notation in agent context, e.g. `winter-harness:/architecture/error-handling.md`. For your own workspace, fork it and point the `url` at your copy.

## Key conventions

- Read the convention file that matches your change *before* writing code — `python/domain-modeling.md` for a new type, `python/error-handling.md` for anything that can fail, `python/repository-pattern.md` for external I/O, and so on.
- `CONTRIBUTING.md` governs commit format and voice rules; `workflows/feature-delivery.md` governs how a change lands.
- When a convention is wrong or stale, fix it where you find it — the harness is meant to be maintained as you work.

:::note[Canonical source]
[`winter-harness`](https://github.com/paul-gross/winter-harness) — start at [`index.md`](https://github.com/paul-gross/winter-harness/blob/master/index.md). The conventions are also rendered in [Conventions & Patterns](/winter-docs/conventions/).
:::
