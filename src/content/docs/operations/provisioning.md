---
title: Provisioning Environments
description: Bring a feature environment to a working state with winter provision — a re-runnable dependency → resource → data lifecycle, separate from winter ws init.
---

`winter ws init` is **structural**: it creates the worktrees, branches, and `.winter.env` for an environment, but it does not install dependencies, create databases, or load seed data. That readiness work is owned by a separate, re-runnable command:

```bash
winter provision alpha
```

`winter provision <env>` brings a freshly-created environment to a working state — and you can re-run it any time to reconcile that state after pulling new migrations, adding a dependency, or resetting a database.

## Why it's separate from `ws init`

Keeping readiness out of `ws init` means the two concerns can evolve and re-run independently:

- **`winter ws init`** is structural and fast — worktrees, branches, git identity, `.winter.env`, and `on_env_init` hooks. Each repo's `cmd` list runs here too, but as a lightweight trust/bootstrap step (e.g. `mise trust`, `direnv allow`), not full dependency installation.
- **`winter provision`** is the readiness lifecycle — dependencies, resources, and data. It is idempotent by design, so re-running it is always safe.

A typical bootstrap is therefore two commands:

```bash
winter ws init alpha       # structural: create the environment
winter provision alpha     # readiness: dependencies, resources, data
```

## The lifecycle: dependency → resource → data

The bare full-chain form runs three sub-targets in a fixed order:

```
dependency → resource → data
```

| Sub-target | What it does |
|------------|--------------|
| `dependency` | Install or check language-level dependencies (`npm install`, `uv sync`, `cargo build`, …). |
| `resource` | Create the backing resources work depends on — databases, message-queue vhosts, object-storage buckets. |
| `data` | Load baseline state — migrations, fixtures, an admin user. |

You can run any single stage on its own:

```bash
winter provision alpha dependency    # dependencies only
winter provision alpha resource      # create resources only
winter provision alpha data          # load baseline state only
```

A handler failure in any sub-target aborts the remaining sub-targets. A sub-target with no declared handlers is simply a no-op.

## Re-running, resetting, and tearing down

Three action flags modify the default `apply` behaviour. Each requires an explicit sub-target — they are not valid on the bare full-chain form:

```bash
winter provision alpha resource --reset      # destroy + recreate resources
winter provision alpha resource --destroy    # destroy resources only
winter provision alpha resource --seed       # create resources, then load data
winter provision alpha data --reset          # wipe + reload data
winter provision alpha data --destroy        # delete data only
```

| Action | Behaviour |
|--------|-----------|
| bare (no flag) | **apply** — idempotent to baseline. For `data`, apply is wipe-and-reload, not append. |
| `--destroy` | Run the declared destroy step; if none is declared, warn and no-op. |
| `--reset` | Use the declared reset step if present; otherwise compose destroy + apply; otherwise degrade to re-apply. |
| `--seed` | `resource` only — apply resources, then apply data in one pass. |

`--reset` and `--destroy` cannot be combined, and `--seed` is valid only on `resource`. Winter tracks no state between runs — handler authors are responsible for keeping each step idempotent.

## Where handlers come from

Provision runs `[[provision.*]]` handlers declared in two places, using the same schema:

- the **workspace config**, `.winter/config.toml`, and
- each installed extension's **`winter-ext.toml`**.

Each handler declares `apply` (required) and, optionally, `destroy`/`reset` and a `scope`. `apply`, `destroy`, and `reset` each accept an **inline shell command** (string) or a **list of inline shell commands** (array) — there are no script paths. A bare string is sugar for a single-command list.

```toml
[[provision.dependency]]
scope = "feature-worktree"
apply = "uv sync && mise trust"          # single inline command (string)

[[provision.resource]]
scope             = "workspace"
apply             = ["createdb myapp", "psql myapp -f schema.sql"]   # array — run in order
destroy           = "dropdb --if-exists myapp"
required_services = ["workspace/postgres"]

[[provision.data]]
scope  = "feature-environment"
apply  = "$WINTER_WORKSPACE_DIR/.winter/config/provision/seed.sh"
```

Each command runs via `sh -c`, so shell constructs (`&&`, `||`, pipes, `$VAR`, globs) work naturally. For arrays, commands run in declaration order and execution stops at the first non-zero exit — that exit code is the handler's result. `WINTER_WORKSPACE_DIR` is set for all scopes; `feature-environment` and `feature-worktree` handlers also receive `WINTER_ENV`, `WINTER_ENV_INDEX`, and `WINTER_PORT_BASE`.

For the full schema — every field, scope semantics, worktree resolution rules, and all environment variables — see the **[config.toml reference → Provision manifests](/winter-docs/cli-reference/config/#provision-manifests)**.

### Scope and ordering

Every handler declares a `scope` that decides where it runs and in what order. Within a sub-target, handlers run substrate-first by scope, and workspace-config handlers run before extension handlers within the same scope:

| Scope | Runs in | When |
|-------|---------|------|
| `workspace` | the workspace root | once per workspace |
| `feature-environment` | the env root (`<env>/`) | once per environment |
| `feature-worktree` | each repo worktree (`<env>/<repo>/`) | once per project worktree in the env |

## Services a handler depends on

A `resource` or `data` handler can declare the services that must be running before it executes:

```toml
[[provision.resource]]
scope             = "workspace"
apply             = ["createdb myapp", "psql myapp -f schema.sql"]
required_services = ["workspace/postgres"]
```

By default, `winter provision` checks those services via `winter service status` and starts any that are not running (by bringing up their owning scope) before executing the handler; started services are left up afterward. Service tokens must be scoped to `workspace/<service>` or the current env — a foreign-env reference is rejected.

```bash
winter provision alpha --no-service-check    # skip the check entirely
```

Skip the check with `--no-service-check` when the service is known to be up, or when the workspace has no service orchestrator registered. If a handler declares `required_services` but no orchestrator is registered, `winter provision` exits with a clean error. See [Running Services](/winter-docs/operations/services/) for the service interface.

## Scripting and diagnostics

`--json` emits an NDJSON event stream — one JSON object per line — covering run start, each sub-target, each command invocation and its output, per-handler results, and a final status. Use it to drive provisioning from tooling:

```bash
winter provision alpha --json
```

With `--dry-run --json`, `plan_handler` events are emitted instead of execution events. Each `plan_handler` event includes a `commands` list (the ordered shell commands that would run) rather than a `script` path.

`winter doctor` includes a `[provision]` probe that validates every declared handler (`scope`, `apply` present and non-empty string or non-empty list of non-empty strings, same for `destroy`/`reset` when present, `required_services` only on `resource`/`data`, no unknown keys) without aborting its other checks.

## Breaking change: inline commands replace script paths

If you have existing provision handlers that point at script paths (e.g. `apply = "scripts/install-deps.sh"`), those values are now treated as inline shell commands passed to `sh -c` — which means they will fail unless the script happens to be on `$PATH`.

**Migrate** by invoking scripts via `$WINTER_WORKSPACE_DIR`:

```toml
# Before (old — no longer works as intended):
apply = "scripts/install-deps.sh"

# After (new):
apply = "$WINTER_WORKSPACE_DIR/.winter/config/provision/install-deps.sh"
```

Because the value runs via `sh -c "<command>"`, a bare path to a script must be executable (`chmod +x`); alternatively, invoke it through an interpreter (e.g. `sh $WINTER_WORKSPACE_DIR/.winter/config/provision/install-deps.sh`) to avoid that requirement. There is no longer any path resolution relative to the workspace root or extension root.

:::note[Canonical source]
The exhaustive, agent-facing reference — the full action vocabulary, the NDJSON event schema, per-scope environment variables, and the doctor probe contract — lives in [`ai/winter-cli/usage/provision.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/provision.md).
:::
