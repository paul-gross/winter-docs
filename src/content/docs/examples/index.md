---
title: Examples
description: The maintainer's own opinionated, swappable implementations — the workflow, conventions, and workspace. Usable as-is, or fork them as a starting point for your own.
---

Some winter repositories are the maintainer's own opinionated implementations of the *swappable* parts of a winter setup — the workflow, the conventions, the workspace. They are real and usable — `winter-workflow` and `winter-harness` install and run like any extension — but they are personal and interchangeable: winter keeps these as swappable components, so you can adopt them as-is, or fork them as the starting point for your own.

The line between the two: a **consumable extension** (see [Extensions](/winter-docs/extensions/)) is a generic, opinion-neutral capability — service orchestration, issue tooling, a backlog model — you install for the function. An **example** is the maintainer's personal, opinionated take on a swappable concern; it installs and runs just the same, but winter offers it as a reference to adopt **or** replace, not as a fixed part of the framework.

## The reference implementations

| Example | What it is | Why it's an example |
|---------|-----------|---------------------|
| **[winter-workflow](/winter-docs/examples/winter-workflow/)** | The maintainer's agentic workflow — the blizzard team, the thaw loop, and the review skills. | A personal, interchangeable methodology. Turnkey — install it and the `/wf-*` skills work — but winter keeps the workflow swappable, so adopt it or fork your own. |
| **[winter-harness](/winter-docs/examples/winter-harness/)** | Winter's development harness — the code, agent-facing-markdown, and process conventions for building winter and all its extensions, each with a reference exemplar. | The conventions for the winter ecosystem specifically, not yet a general-purpose convention set. Swappable by design: fork it as the starting point for a harness of your own. |
| **[winter-workspace](/winter-docs/examples/winter-workspace/)** | The meta-workspace winter itself is built in, pre-wired to the maintainer's repos. | A worked example of an assembled winter workspace, not a template to clone — it carries the maintainer's specific repos and choices. |

## How to use them

Use them as-is, or fork them:

- Install **winter-workflow** and its `/wf-*` skills work immediately; adapt its agent roles and review loops to your team, or replace it wholesale — the workspace is the stable integration surface and the workflow is a swappable component.
- Reference **winter-harness**'s conventions directly, or fork it as a template for a conventions repo of your own: keep the Canon (universal authoring principles) and the winter-ecosystem markdown shape (READMEs, extension `index.md` rules), and fill in the code and domain invariants your projects actually need.
- Stand up your own workspace the way **winter-workspace** is assembled, declaring your own `[[project_repository]]` and `[[standalone_repository]]` entries in `.winter/config.toml`.
