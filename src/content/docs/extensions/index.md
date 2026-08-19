---
title: Extensions
description: Opt-in capabilities a winter workspace installs — product backlog, service orchestration, and issue tooling.
---

Extensions are standalone or project repositories through which a winter workspace gains optional capabilities beyond
the core CLI. An extension contributes only the surfaces it ships: these can include **skills**, **agents**, reusable
**methodology**, lifecycle **hooks** (`on_env_init` / `on_env_destroy` / `on_workspace_reconcile`), **`winter doctor`
probes**, **`winter lint` checks**, services, provisioning handlers, or capability providers. None of those artifact
kinds is universal; optional capability providers are declared per manifest under `[provides]`.

**What makes something an installed extension** — it is a repository with a root `winter-ext.toml` manifest, declared in
workspace configuration as either a standalone or project repository and reconciled by `winter ws init`. The workspace
graph shows one module node per manifest and `requires` dependency edges between those nodes; it does not enumerate
shipped artifacts or imply that every extension provides a registered capability. This distinguishes extensions from
[related projects](/winter-docs/related-projects/) (editor integrations or user-level tools that read workspace state
but are not installed by winter) and from [examples](/winter-docs/examples/) (the maintainer's own opinionated,
swappable implementations).

The repository kind determines lifecycle and context routing, not which extension features are available. A standalone
extension has one clone at its configured workspace path and no per-environment worktrees. A project-repo extension uses
the project's existing source checkout and feature worktrees, with no separate standalone clone; winter processes its
skills, agents, hooks, lint and doctor checks, graph metadata, capabilities, services, and provisioning handlers in
place from the source checkout. For agent context, however, `AGENTS.winter.md` routes to the active environment's
project worktree instead of eagerly importing source-checkout content; when no environment is in scope, that route falls
back to the source checkout.

## The maintained extensions

These are *consumable* extensions — generic capabilities a workspace installs and uses as-is:

| Extension                                                                   | Adds                                                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **[winter-product](/winter-docs/extensions/winter-product/)**               | A product backlog model with refinement agents and skills.                                             |
| **[winter-service-tmux](/winter-docs/extensions/winter-service-tmux/)**     | tmux-based service orchestration (`up` / `down` / `status` / `restart`).                               |
| **[winter-service-docker](/winter-docs/extensions/winter-service-docker/)** | Docker Compose-based service orchestration with real container health checks and workspace singletons. |
| **[winter-github](/winter-docs/extensions/winter-github/)**                 | AI-native GitHub issue tooling and the ideation-to-delivery loop via the `gh` CLI.                     |

The maintainer's conventions ([winter-context](/winter-docs/examples/winter-context/)) and agentic workflow
([winter-workflow](/winter-docs/examples/winter-workflow/)) install and run just like these, but they are the
maintainer's own opinionated, swappable implementations — adopt them as-is or fork your own. They're grouped under
[Examples](/winter-docs/examples/).

## Service orchestration providers

`winter-service-tmux` and `winter-service-docker` both implement the `winter service` capability slot. Under the
multi-provider contract they can be bound together
(`capabilities.service = ["winter-service-tmux", "winter-service-docker"]`): `winter service up`/`down`/`status` fan out
across every bound provider, and each individual service is owned by exactly one provider. A single-provider
registration looks like:

```toml
[capabilities]
service = "winter-service-tmux"   # or "winter-service-docker" or both as a list
```

Choose **tmux** when your services are native processes, you want interactive terminal panes, or Docker adds friction
without benefit. Choose **Docker** when your project already ships a Compose file, you need genuine container
health/readiness via `--wait`, or you want workspace-singleton services running once for all environments. See
[winter-service-docker](/winter-docs/extensions/winter-service-docker/#when-to-adopt) for the full decision guide.

Or **mix and match** to get the best of both worlds: bind both providers and let each own the slice of the stack it
handles best — Docker containers for workspace-level database servers and other daemon tools, and tmux sessions for the
local application services you change rapidly. `winter service` fans out across both, so a single `up` brings the whole
stack online.

## How extensions install

The common path for installing a consumable extension is to declare it as a `[[standalone_repository]]` in
`.winter/config.toml`, then run `winter ws init` (or `/ws-setup`):

```toml
[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"   # optional; defaults to the repo name
```

If a configured `[[project_repository]]` has `winter-ext.toml` at its root, it is already extension-eligible in place
and needs no separate `[[standalone_repository]]` declaration.

During reconcile, winter reads the extension's `winter-ext.toml` manifest and processes the artifact kinds the extension
actually ships. Skills receive a short **prefix** and are symlinked for Claude Code and Codex or copied for OpenCode.
Canonical agent definitions are transformed into prefixed per-harness files, but invocation identity differs: Claude
Code and Codex use the unprefixed canonical agent name, while OpenCode uses the prefixed projected filename. Prefixes
keep installed artifacts from colliding and let the same workspace install several extensions at once.

An extension manifest can also declare lifecycle hooks, a `doctor` probe, and a `lint` check:

```toml
name = "winter-service-tmux"
prefix = "wst"
doctor = "scripts/doctor.sh"   # NDJSON health probe for `winter doctor`
lint   = "scripts/lint.sh"     # NDJSON convention checks for `winter lint`
[hooks]
on_env_init            = "./hooks/init.sh"
on_env_destroy         = "./hooks/destroy.sh"
on_workspace_reconcile = "./hooks/workspace-reconcile.sh"
```

There are two kinds of hook:

- **Per-env hooks** (`on_env_init` / `on_env_destroy`) fire once per feature environment — on every
  `winter ws init <env>` and `winter ws destroy <env>`. Use them to provision and release environment-specific state
  (tmux sessions, databases, file watchers).
- **Workspace hook** (`on_workspace_reconcile`) fires once per workspace-level reconcile (`winter ws init` with no
  target, or `winter ws init --all`). Use it for workspace-level artifacts that should be regenerated whenever the
  workspace is reconciled — config files, reference maps, or external registrations that belong to the whole workspace
  rather than to any single environment.

See the [config.toml reference](/winter-docs/cli-reference/config/#extension-hooks) for the full hook contract — env
vars, cwd, firing order, and failure semantics — and the `adopt_extensions` modes that control how aggressively winter
processes an extension's skills and agents.

The guides in this section explain, for each extension: what it contributes, when to adopt it, how to configure it, and
its key conventions.

## Plugins: extending the dashboard and CLI

Beyond skills, agents, and hooks, an extension (or a standalone `.winter/plugins/` directory) can ship a **TUI plugin**
— a `plugin.py` that contributes status badges, TUI screens, and keybound actions to the running dashboard. See
[Authoring a TUI plugin](/winter-docs/tui-plugins/authoring/).
