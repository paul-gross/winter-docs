---
title: What is Winter?
description: Winter is a framework for agentic, multi-worktree, multi-repository development workspaces.
---

Winter is a framework for **agentic, multi-worktree, multi-repository development**. It turns a directory of related git repositories into a single *workspace* where many features — and many AI agents — can be developed in parallel, each in its own isolated set of worktrees, ports, and services. The project repositories themselves know nothing about winter; all of the workspace machinery lives alongside them.

## The problem it solves

Real systems span more than one repository: a web app, an API, shared libraries, infrastructure. Working on a feature that touches several of them means juggling matching branches across repos, dodging port collisions when you run more than one copy of the stack, and reconstructing scattered context every time you switch tasks.

Agentic development sharpens every one of those pain points. Several agents working at once will trip over each other's branches, working trees, and running services. Winter gives **each unit of work its own feature environment** — a coordinated set of git worktrees across every repo, a private block of ports, and its own services — so parallel work (whether by people or agents) proceeds without interference.

## The three layers

Winter is built in three layers. You can adopt just the CLI and add the rest as you need them.

### 1. The CLI (`winter`)

The `winter` command manages the workspace. It clones your repositories, creates per-feature *worktrees* across all of them on a shared branch, assigns each environment a non-colliding block of ports, and provides cross-repo git operations (`fetch`, `pull`, `push`, `merge`, `connect`). It reconciles the workspace against a single declarative config file, so setup is idempotent and repeatable.

→ [CLI Reference](/winter-docs/cli-reference/)

### 2. Extensions

Extensions are opt-in capabilities a workspace installs as standalone repositories. Each one contributes skills, agents, lifecycle hooks, health probes, and convention checks to the workspace. The maintained set covers tmux **service orchestration**, AI-native **issue tooling**, a **product backlog**, reusable **code and markdown conventions**, and the **agentic workflow** itself.

→ [Extensions](/winter-docs/extensions/)

### 3. The agentic workflow

The top layer is how agents actually work: defined agent **roles** (developer, reviewer, verifier, explorer, and more) and the **loops** that coordinate them — a "blizzard" for net-new features, a "thaw" for focused changes, and a pre-push review that fans out independent reviewers. The harness is designed so agents can write code, run the app, verify their own changes, and review their own work.

→ [Conventions & Patterns](/winter-docs/conventions/)

## Workspace topology

A winter workspace is one directory containing source checkouts and one or more feature environments:

```text
my-workspace/                  ← workspace root (winter config + agent context)
├── .winter/
│   ├── config.toml            repo declarations (project + standalone)
│   └── ext/<name>/            installed extensions
├── projects/                  source checkouts — never edited directly
│   ├── app-web/   (main)
│   ├── app-api/   (main)
│   └── shared/    (main)
├── alpha/                     feature environment   (port base 4020 by default)
│   ├── app-web/   (alpha)     ← worktree of projects/app-web
│   ├── app-api/   (alpha)
│   ├── shared/    (alpha)
│   └── up / down / status / restart   service controls for this env
└── beta/                      feature environment   (port base 4040 by default)
    ├── app-web/   (beta)
    ├── app-api/   (beta)
    └── shared/    (beta)
```

Every repository is materialised in two places: a **source checkout** under `projects/<repo>/` that stays on the main branch and is never edited directly, and a **worktree** inside each feature environment (`alpha/<repo>/`, `beta/<repo>/`, …) on a branch named after that environment. All edits happen in the feature worktrees.

## Where to go next

- **[Quick Start](/winter-docs/getting-started/quick-start/)** — install winter, bootstrap a workspace, create your first feature environment, and run a service.
- **[Glossary](/winter-docs/getting-started/glossary/)** — the handful of terms winter uses everywhere: worktree, feature environment, Greek-letter index, pinned repo, extension, path notation.
- **[Operations](/winter-docs/operations/)** — the day-to-day model for feature environments, polyrepo git, and services.

:::note
This documentation site is generated and deployed from [`paul-gross/winter-docs`](https://github.com/paul-gross/winter-docs). The framework itself lives at [`paul-gross/winter`](https://github.com/paul-gross/winter).
:::
