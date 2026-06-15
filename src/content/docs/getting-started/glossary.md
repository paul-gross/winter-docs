---
title: Glossary
description: The core terms winter uses throughout — worktree, feature environment, Greek-letter index, pinned repo, extension, and path notation.
---

The terms below appear throughout winter's documentation and tooling.

## Workspace

The top-level directory winter manages. It contains the winter config (`.winter/config.toml`), the source checkouts under `projects/`, any installed extensions, and one directory per feature environment. The workspace is itself a git repository; the project repos it manages are separate repositories cloned into it.

## Worktree

A git worktree is a second working directory attached to the same repository, checked out to a different branch. Winter uses worktrees so a single cloned repo can be checked out to many feature branches at once — one per feature environment — without re-cloning. See `git worktree` for the underlying mechanism.

## Source checkout

The copy of a project repository under `projects/<repo>/`. It stays on the repo's main branch and is **never edited directly**. Feature worktrees are created from it. Source checkouts are kept fast-forwarded as you sync.

## Feature environment

A coordinated set of worktrees — one for every project repository — that all share a single branch name and a private block of ports. A feature environment (e.g. `alpha/`) is where a unit of work actually happens; multiple environments can exist and run simultaneously without interfering. Often shortened to "env."

## Greek-letter index

Feature environments are conventionally named after Greek letters (`alpha`, `beta`, `gamma`, … through `omega`), and each letter carries a fixed index from 1 to 24. The index sets the environment's port offset: ports start at **4000** and each index adds **+100**, so `alpha` (1) → 4100, `beta` (2) → 4200, and so on. This guarantees two environments never collide on a port. Non-Greek environment names get a deterministic hashed index in the range 26–281.

## Pinned repo

A project repository that does **not** participate in feature branching. A pinned repo's worktree always tracks the main branch instead of the environment branch — useful for shared tooling or vendored dependencies that you want present in every environment but never fork per-feature. Pinned repos are excluded from feature pushes by default.

## Standalone repo

A repository cloned at the workspace root (or a configured path) rather than into `projects/`, and **not** worktreed per feature. Used for winter extensions and any auxiliary repo you want available alongside the project repos but not multiplied across environments.

## Extension

An opt-in capability a workspace installs, shipped as a standalone repository with a `winter-ext.toml` manifest. An extension contributes skills, agents, lifecycle hooks (`on_env_init` / `on_env_destroy` / `on_workspace_reconcile`), `winter doctor` probes, and `winter lint` checks. Examples: service orchestration, issue tooling, the product backlog, conventions, and the agentic workflow.

## Path notation

A `<context>:<path>` prefix winter's docs and agents use to make clear which repo or branch a file lives in:

- `workspace:` — the workspace root (the workspace repo's branch).
- `<env>:` — a feature environment (e.g. `alpha:` resolves to a per-repo worktree inside `alpha/`).
- `<extension-name>:` — a file inside an installed extension (e.g. `winter-harness:/architecture/error-handling.md`).

## Reconcile

The idempotent operation `winter ws init` performs: bring the filesystem into alignment with `.winter/config.toml`. It clones missing repos, refreshes git identity and excludes, runs each repo's setup `cmd`, and processes extensions. Safe to run at any time.

When invoked without a target (`winter ws init`) or with `--all`, reconcile also fires each extension's `on_workspace_reconcile` hook once, after repos are cloned/updated and before any per-env loop.

## See also

- [What is Winter?](/winter-docs/getting-started/) — the conceptual overview and topology.
- [Operations](/winter-docs/operations/) — how these pieces are used day to day.
