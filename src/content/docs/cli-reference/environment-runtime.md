---
title: Environment Runtime
description: Commands for starting services, provisioning, and cleaning feature environments — winter service, winter provision, and winter clean.
---

Commands for bringing a feature environment's services up, provisioning its dependencies and data, and resetting its
disposable build artifacts between tenants. Service orchestration requires a registered orchestrator extension — see the
[config.toml Reference → Capability registry](/winter-docs/cli-reference/config/#capability-registry). Provision and
clean handler configuration lives in the
[config.toml Reference → Provision manifests](/winter-docs/cli-reference/config/#provision-manifests).

## `winter service`

Control an environment's services through a stable interface that dispatches to whichever orchestrator extension the
workspace registers. Consumers always depend on `winter service …`, never on the implementation, so the backend (tmux
today, containers or a daemon tomorrow) can be swapped without re-teaching agents, docs, or habits.

```bash
winter service up alpha                               # start the environment's services
winter service down alpha                             # stop them
winter service status                                 # every configured env, stopped ones shown stopped
winter service status alpha                           # all services in alpha (expands to alpha/*)
winter service status alpha/api                       # one specific service
winter service status 'alpha/worker-*'                # services matching a glob within alpha
winter service status '*/backend'                     # backend service across every env
winter service restart alpha/api beta/worker-main     # bounce specific services (≥1 required)
winter service restart 'alpha/worker-*'               # bounce all matched workers in alpha
winter service logs alpha                             # stream all services' logs in alpha
winter service logs alpha/api                         # logs for one service (no prefix)
winter service logs 'alpha/worker-*'                  # aggregate logs across matched services in alpha
winter service logs '*/backend'                       # backend logs across all envs
winter service logs alpha -f                          # stream live until Ctrl-C (exit 130)
winter service logs alpha -n 50                       # last 50 lines
winter service logs alpha --since=5m                  # logs from the past 5 minutes
winter service logs alpha --since=2026-06-13T10:00:00Z  # since an absolute timestamp
winter service logs alpha -t                          # prefix each line with its RFC3339 timestamp
```

`status`, `restart`, and `logs` use **segment-aware glob PATTERNS** over `<env>/<service>` — the same vocabulary
`winter ws` uses for `<env>/<repo>`. Within each segment, `*`, `?`, and `[...]` match as usual; `*` does not cross `/`.
A bare `<env>` expands to `<env>/*`. Cross-environment selection is supported: `'*/backend'` selects the `backend`
service across every env. `up` and `down` always operate on the whole environment. For `restart` and `logs`, at least
one pattern is required. For `status`, omitting all patterns selects every service in every env — enumeration is
registry-driven, so every configured environment appears, with stopped environments shown as stopped rather than
omitted.

`logs` accepts
`PATTERN... [-f/--follow] [-n/--tail N] [--since DURATION|TIMESTAMP] [--until DURATION|TIMESTAMP] [-t/--timestamps]` (at
least one PATTERN required). Each output line is prefixed with `<env>/<svc> |` whenever more than one service may be in
scope — see the
[orchestrator contract](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/service.md#orchestrator-contract)
for the precise rule. Lines are written as portable plain text so `winter service logs alpha | grep ERROR` works
regardless of orchestrator.

To register an orchestrator, set `capabilities.service` in the `[capabilities]` table in `.winter/config.toml` and
`provides.service` in the extension's `winter-ext.toml` — see the
[config reference](/winter-docs/cli-reference/config/#capability-registry) for the schema and the
[orchestrator contract](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/service.md#orchestrator-contract)
for the full implementer-facing spec (argv rule, `WINTER_*` env vars, NDJSON wire format). The legacy
`service_orchestrator` (workspace config) and `orchestrate_services` (extension manifest) keys are deprecated
back-compat aliases — existing configs continue to work, but new workspaces should use `[capabilities]`/`[provides]`.

## `winter provision`

Bring a feature environment to a working state after `winter ws init`: install dependencies, create resources
(databases, queues, buckets), and load seed data. Re-runnable and idempotent. Reads `[[provision.*]]` handlers from
`.winter/config.toml` and each installed extension's `winter-ext.toml` — see the
[config reference → Provision manifests](/winter-docs/cli-reference/config/#provision-manifests).

```bash
winter provision alpha                               # full chain: dependency → resource → data
winter provision alpha --stage dependency            # one sub-target only
winter provision alpha --stage resource --reset      # destroy + recreate resources
winter provision alpha --stage resource --destroy    # destroy resources only
winter provision alpha --stage resource --seed       # create resources, then load data
winter provision alpha --stage data --reset          # wipe + reload data
winter provision alpha --no-service-check            # skip the required_services check
winter provision alpha --json                        # NDJSON event stream
```

The bare form runs all three sub-targets (`dependency` → `resource` → `data`) in order; a handler failure aborts the
rest. `--reset` and `--destroy` require an explicit `--stage` or a `--name` selector; `--seed` is valid only on
`--stage resource`, and `--reset`/`--destroy` cannot be combined. When a `resource`/`data` handler declares
`required_services`, winter starts any that are not running before executing it (unless `--no-service-check`). See
[Provisioning Environments](/winter-docs/operations/provisioning/) for the model and
[`context/winter-cli/usage/provision.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/provision.md)
for the full contract.

## `winter clean`

Reset a feature environment's disposable build artifacts by running each matched `[[provision.*]]` handler's own
declared `clean` command, across the same `dependency` → `resource` → `data` chain `winter provision` uses. A handler
declaring no `clean` contributes nothing and is not an error — this makes handover between tenants cheap without
destroying the dependency trees a full reinstall would have to rebuild. Unlike `winter provision`, a failing `clean`
does not abort the chain: every remaining handler still runs, and the command exits non-zero if any handler's `clean`
failed. It runs immediately against every matched env; `--dry-run` is the preview to run first. `PATTERNS` is a bare
env-name glob, the same grammar `winter provision` uses, with at least one required — see the
[patterns reference](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/ws/patterns.md#winter-provision--winter-clean--winter-ws-destroy--env-level-patterns)
for the full grammar.

```bash
winter clean alpha                              # full chain
winter clean alpha --stage resource             # clean one sub-target only
winter clean alpha --name workspace.mydb        # clean just the named entry
winter clean alpha --no-service-check           # skip the required_services check
winter clean alpha --json                       # NDJSON event stream
winter clean alpha --dry-run                    # preview the plan; nothing runs, no service starts
```

When a `resource`/`data` handler declares `required_services`, `winter clean` checks and starts them before running that
handler's `clean` command, the same contract `winter provision` uses above — unless `--no-service-check` is given.

**This is not `winter ws clean`** — that command is a git-level `git clean -fd` over a worktree's untracked files;
`winter clean` runs project-declared removal commands instead and knows nothing about git state. See
[`context/winter-cli/usage/clean.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/clean.md)
for the full contract, including the sub-target and named-entry selectors and the failure-handling behavior.
