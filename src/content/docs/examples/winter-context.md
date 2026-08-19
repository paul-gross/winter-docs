---
title: winter-context
description: The conventions layer — winter's facts and standards plus packaging rules for agent-facing artifacts.
---

**[winter-context](https://github.com/paul-gross/winter-context)** is the conventions layer. It is the single source of
truth for winter-ecosystem code and documentation standards, feature-delivery facts and defaults, and the packaging and
composition rules for agent-facing artifacts. It can contain methodology-related policy facts; reusable operational
procedures such as build, review, and completion processes belong to a methodology product such as winter-workflow.

It's grouped under [Examples](/winter-docs/examples/) because winter keeps the context layer a swappable component.
Today it encodes the conventions for winter and its extensions specifically — it is not a general-purpose convention
library — but you reference it directly by path notation, and it stands as a worked model for a context layer of your
own.

## What it contributes

winter-context *is* its conventions — unusually, its content lives at the top of the repo (not under `context/`),
because the conventions are its public surface, addressed via the `winter-context:` path notation. It builds on the
separate [`winter-canon`](https://github.com/paul-gross/winter-canon) extension and is organised by **convention
domain**, each directory naming the subject it governs:

- **Agent context** (`agent-context/`) — winter-ecosystem packaging and composition facts for agent-facing artifacts:
  agent and skill adapters, extension `index.md` files, path references and naming, and the lints that enforce them.
  Applies Canon without owning it.
- **Documentation** (`documentation/`) — the public, adopter-facing docs: README form, the no-undocumented-feature
  invariant, and the consumable-vs-example catalog.
- **Architecture & standards** (`architecture/`, `standards/`, `exemplars/`) — conventions for application code at
  plan/build time and at review time (domain modeling, error handling, dependency injection, the repository pattern,
  protocol conformance, subprocess use, logging, module layout, linting, typechecking, testing), each with a reference
  exemplar showing the expected shape.
- **Workflows & tooling** (`workflows/`, `tooling/`) — winter-ecosystem feature-delivery facts, defaults, and invariants
  (worktree model, branch naming, push target, the rebase rule, pre-push checks) plus cross-cutting rules for external
  tools such as the `gh` CLI.

## What to take from it

Its conventions target winter and its extensions today, so what transfers to other projects is the *shape*, not the
facts. The packaging model for agent-facing artifacts carries over; your own project remains responsible for its code,
domain, and delivery facts. The universal ownership principle lives separately in
[`winter-canon:/facts-vs-methodology.md`](https://github.com/paul-gross/winter-canon/blob/master/facts-vs-methodology.md).
winter-context applies that principle to packaging, while [winter-workflow](/winter-docs/examples/winter-workflow/) owns
the reusable operations those adapters execute.

## How it's wired in

As a real standalone repo, declared in `.winter/config.toml` like any other — examples are installed; only how the docs
frame them differs:

```toml
[[standalone_repository]]
name = "winter-context"
url = "git@github.com:paul-gross/winter-context.git"
path = ".winter/ext/context"
```

It contributes no skills or agents of its own. It defines winter's delivery and packaging defaults, while
winter-workflow supplies reusable procedures that adapters execute. Reference its files by path notation in agent
context, e.g. `winter-context:/architecture/error-handling.md`. For your own workspace, point the `url` at a conventions
repo of your own, shaped after this one.

## Key conventions

- Read the convention file that matches your change *before* writing code — `architecture/domain-modeling.md` for a new
  type, `architecture/error-handling.md` for anything that can fail, `architecture/repository-pattern.md` for external
  I/O, and so on.
- `CONTRIBUTING.md` and `workflows/feature-delivery.md` state winter's delivery facts and constraints; winter-workflow
  owns reusable delivery methodology.
- When a convention is wrong or stale, fix it where you find it — the harness is meant to be maintained as you work.

:::note[Canonical source] [`winter-context`](https://github.com/paul-gross/winter-context) — start at
[`index.md`](https://github.com/paul-gross/winter-context/blob/master/index.md). The conventions are also rendered in
[Conventions & Patterns](/winter-docs/conventions/). :::
