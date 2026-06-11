---
title: Quick Start
description: Install winter, bootstrap a workspace, create your first feature environment, and run a service.
---

This walkthrough takes you from nothing to a running service in a feature environment. It assumes you have a workspace repo (a directory with a `.winter/config.toml` and the winter CLI under `tools/winter-cli/`) — for example a fork of [`paul-gross/winter`](https://github.com/paul-gross/winter).

## Prerequisites

- **git**
- **Python 3.11+**
- **[mise](https://mise.jdx.dev/)** and **[uv](https://docs.astral.sh/uv/)** — the `winter` wrapper runs the CLI through them, so no manual virtualenv setup is needed.
- **tmux** — only if you use the service-orchestration extension.

## 1. Install the CLI

From the workspace root:

```bash
./tools/winter-cli/install.sh
```

This copies a `winter` wrapper into `~/.local/bin/`. The wrapper auto-discovers the workspace root by searching upward for `.winter/config.toml` + `tools/winter-cli/`, so you can run `winter` from anywhere inside the workspace.

Confirm everything is wired up:

```bash
winter doctor
```

`doctor` reports `pass` / `warn` / `fail` across core checks (git, Python, config parses, repos present) plus any probes contributed by installed extensions.

## 2. Declare your repositories

Workspace configuration lives in `.winter/config.toml`. Each project repository is one `[[project_repository]]` block:

```toml
main_branch = "main"

[[project_repository]]
name = "app-web"
url = "git@github.com:your-org/app-web.git"
cmd = ["pnpm install"]        # run after clone and in every worktree

[[project_repository]]
name = "app-api"
url = "git@github.com:your-org/app-api.git"
```

Per-user settings (your git identity) go in the gitignored overlay `.winter/config.local.toml`. See the [config.toml reference](/winter-docs/cli-reference/config/) for every config key.

:::tip
If you are starting a brand-new workspace, the `/ws-setup` skill walks you through this configuration interactively.
:::

## 3. Bootstrap the workspace

Clone every declared repository into `projects/`:

```bash
winter ws init
```

This is idempotent — re-run it any time after changing the config. It clones missing repos, applies your git identity, runs each repo's `cmd` list, and installs extensions.

## 4. Create your first feature environment

Feature environments are named after Greek letters. Create `alpha`:

```bash
winter ws init alpha
```

This adds a worktree of every project repo under `alpha/`, all on a branch named `alpha`, and seeds the environment with a private block of ports (alpha → 4100, beta → 4200, …). Your code now lives at `alpha/app-web/`, `alpha/app-api/`, and so on.

:::caution
Never edit the source checkouts under `projects/` directly — they stay on the main branch. All work happens in a feature environment's worktrees.
:::

## 5. Run a service

With the [service-orchestration extension](/winter-docs/extensions/) installed, each environment gets `up` / `down` / `status` scripts that launch your services in a per-environment tmux session:

```bash
cd alpha
./up        # start the environment's services
./status    # see what's running
./down      # stop them cleanly
```

Because each environment has its own port block, you can run `alpha` and `beta` side by side without collisions.

## 6. Ship your work

Commit per repo with plain git inside each worktree, then push the whole environment to its tracked upstreams:

```bash
winter ws push alpha
```

:::note
Pinned repos (those tracking `origin/<main>` directly) are **excluded from `push` by default**. If `winter ws push` reports `pinned repo(s) with commits skipped`, re-run with `--include-pinned`. See [Pinned repos](/winter-docs/operations/polyrepo-git/#pinned-repos).
:::

## Next steps

- **[Operations](/winter-docs/operations/)** — the full model for environments, polyrepo git, and services.
- **[CLI Reference](/winter-docs/cli-reference/)** — every `winter` subcommand.
- **[Glossary](/winter-docs/getting-started/glossary/)** — the terms used throughout these docs.
