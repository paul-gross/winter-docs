---
title: Examples
description: The maintainer's own opinionated, swappable implementations — the workflow, conventions, and workspace. Usable as-is, or fork them as a starting point for your own.
---

Some winter repositories are the maintainer's own opinionated implementations of the *swappable* parts of a winter setup — the workflow, the conventions, the workspace. They are real and usable — `winter-workflow` and `winter-harness` install and run like any extension — but they are personal and interchangeable: winter keeps these as swappable components, so you can adopt them as-is, or fork them as the starting point for your own.

The line between the two: a **consumable extension** (see [Extensions](/winter-docs/extensions/)) is a generic, opinion-neutral capability — service orchestration, issue tooling, a backlog model — you install for the function. An **example** is the maintainer's personal, opinionated take on a swappable concern; it installs and runs just the same, but winter offers it as a reference to adopt **or** replace, not as a fixed part of the framework.

## winter-workflow

**Concern:** the agentic workflow — how agent teams are composed, how work is decomposed and sized, and how builds and reviews are structured.

**Highlights:** role-pure agents (each does one job; the caller injects coordination), a build-skill selection model that matches ceremony to task size (Blizzard for large coordinated work, Glacier for one phased feature, Flurry for a batch of parallel small features, Delegate for ad hoc conversational work, Thaw for narrow fixes), and review loops that run on independent axes (code, harness, agent-facing markdown, external docs).

**Why opinionated and swappable:** a workflow encodes personal methodology — how to decompose work, which roles exist, when to escalate. Winter keeps the workflow a swappable component so teams can replace the methodology without touching the framework. The philosophy is that each developer brings their own taste in workflow. Forcing a single workflow on everyone squashes innovation and preference; letting workflows stay independent lets each person emphasize the cross-cutting concerns they care about most — a healthy addition to the ecosystem rather than fragmentation to be stamped out.

**Positioning:** turnkey — install it and the `/wf-*` skills work immediately. Fork it and point `url` at your copy to maintain your own methodology. → [winter-workflow](/winter-docs/examples/winter-workflow/)

## winter-harness

**Concern:** the conventions layer — code, agent-facing markdown, and process conventions, each documented in a file and backed by a reference exemplar.

**Highlights:** four layers (Canon: universal authoring principles independent of any domain; Markdown: winter-ecosystem agent-facing doc shape; Code: Python conventions with exemplars; Process: delivery workflow), the facts/methodology split that keeps conventions in one canonical place rather than duplicated across reviewers, and convention-per-file organisation so agents read exactly the file that matches their change.

**Why opinionated and swappable:** the conventions encode decisions specific to the winter ecosystem and the maintainer's Python projects — not general-purpose rules. Winter keeps the harness swappable so teams can maintain their own conventions without modifying the framework.

**Positioning:** a worked reference rather than a fork target. The Canon (universal authoring principles) and the winter-ecosystem markdown conventions transfer broadly; the code and process conventions are specific to winter's Python repos. It is most useful as a model that informs a harness of your own, not a base to clone wholesale. → [winter-harness](/winter-docs/examples/winter-harness/)

## winter-workspace

**Concern:** an assembled workspace — how `config.toml`, `CLAUDE.md`, `ai/` docs, and feature environments compose into a working multi-repo development environment.

**Highlights:** a real `config.toml` declaring project repos and standalone extensions, a committed `CLAUDE.md` that orients agents to the layout and the env model, and the `ai/` docs that capture this workspace's conventions. The whole stack — framework, CLI, extensions, and the documentation site — developed in one place.

**Why opinionated and swappable:** every workspace declares its own repos, prefixes, and choices. winter-workspace carries the maintainer's.

**Positioning:** a worked example to read and understand the shape of an assembled workspace. Not a template to clone — see the [Quick Start](/winter-docs/getting-started/quick-start/) to stand up your own. → [winter-workspace](/winter-docs/examples/winter-workspace/)
