---
title: What is Winter?
description: Winter is a framework for agentic, multi-worktree, multi-repository development workspaces.
---

Winter is a framework for **agentic, multi-worktree, multi-repository development**. It turns a directory of related git repositories into a single *workspace* where many features — and many AI agents — can be developed in parallel, each in its own isolated set of worktrees, ports, and services. The project repositories themselves know nothing about winter; all of the workspace machinery lives alongside them.

## The problem it solves

Developing more than one feature at a time means juggling branches, working trees, ports, running services, and the scattered context of each task — and the moment two copies of the stack run at once, they collide. Agentic development sharpens every one of those pain points: several agents working in parallel trip over each other's branches, working trees, and running services.

Winter gives **each unit of work its own feature environment** — an isolated set of git worktrees, a private block of ports, and its own services — so parallel work, whether by people or agents, proceeds without interference. When a feature spans more than one repository — a web app, an API, shared libraries, infrastructure — that environment spans all of them at once, with matching branches lined up across every repo.

## When to use Winter

Winter works well across different repository topologies and execution models. These cases are complementary rather than mutually exclusive.

**Monorepo**

Even when all of your source lives in a single repository, winter's isolated feature environments remain valuable. Each unit of work gets its own git worktree — keeping branches, working trees, and running services separate from every other concurrent task — along with a dedicated port band. Multiple agents can work on independent features simultaneously without interfering with each other's builds or services. Provisioning handlers are idempotent, so every agent starts from a known-good state.

**Polyrepo**

Winter is built around interchangeable parts — repositories, extensions, service orchestrators, and workflows are all swappable components — and a workspace can compose as many repositories as you need. Coordinating a *single change across several of those repositories* is an add-on layered on that design rather than the reason winter exists, but it is a first-class one. Such a change is captured as a single feature environment: matching worktrees on the same branch name across every repo, a single port block, and a shared service lifecycle. Cross-repo git operations (`fetch`, `pull`, `push`, `merge`, `connect`) work on the whole coordinated set at once.

**Cloud agents**

Running agents in ephemeral cloud environments is orthogonal to repository topology — it compounds the value of whichever topology you already have, rather than forming a third exclusive option.

A cloud agent can bootstrap a complete workspace from scratch: clone the workspace config, pull the project repositories and installed extensions, install dependencies, run provisioning steps, start workspace- and feature-scoped services, and load or reset data — all driven by the single declarative `config.toml`. From there the agent runs the full development loop: make cross-repo changes in coordinated worktrees, validate against live services, commit, and push toward a pull request. Every step is repeatable because the workspace setup is idempotent.

Across all three, the workflow that drives development is itself a swappable component. You can package a workflow — whether it runs locally or in a cloud agent — as a harness-like extension and share it across multiple projects, instead of re-implementing the loop in each one.

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

## What is harness engineering?

*Harness engineering* is the practice of designing a system so that agents — human or AI — can work on it reliably and at scale. The discipline is described in depth at [paul-gross/harness-engineering](https://github.com/paul-gross/harness-engineering). A harnessed project gives every contributor: declarative setup that reaches a known-good state without manual steps, discoverable context about the project's structure and conventions, executable operations for common tasks, observable services with health signals and structured logs, repeatable provisioning and data loading, validation gates that catch problems before they propagate, and replaceable components so teams can swap tools without restructuring their workflow.

Winter is a concrete example of a harnessed application. Its declarative `config.toml` covers workspace setup idempotently. Extensions expose discoverable context (`context/` directories, `CLAUDE.md`) and executable operations (CLI commands, service scripts, skill entrypoints). The service layer surfaces health and logs. Provisioning handlers and doctor/lint checks act as validation doors. Every layer — CLI, extensions, workflow — is independently replaceable.

The same approach applies to both new and existing projects. On a greenfield project you establish the harness alongside the first production code: commit conventions, `context/` context files, and a `config.toml` that a fresh clone can bring up in minutes. On an existing brownfield system you add the harness incrementally — a `CLAUDE.md` here, a workspace config there — without restructuring the repositories themselves.

A harness can even be a winter repository in its own right, and the workspace can hold it twice over: once as a standalone repository that supports work across the whole workspace, and again as a project repository that appears as a coordinated worktree inside each feature environment. That dual presence lets a single feature environment improve the harness in isolation — exercising the change against real work — without interfering with the standalone copy that other feature environments, and the agents working in them, rely on. Winter itself is built this way: the workspace develops winter using winter.

## Where to go next

- **[Quick Start](/winter-docs/getting-started/quick-start/)** — install winter, bootstrap a workspace, create your first feature environment, and run a service.
- **[Glossary](/winter-docs/getting-started/glossary/)** — the handful of terms winter uses everywhere: worktree, feature environment, Greek-letter index, pinned repo, extension, path notation.
- **[Operations](/winter-docs/operations/)** — the day-to-day model for feature environments, polyrepo git, and services.

:::note
This documentation site is generated and deployed from [`paul-gross/winter-docs`](https://github.com/paul-gross/winter-docs). The framework itself lives at [`paul-gross/winter`](https://github.com/paul-gross/winter).
:::
