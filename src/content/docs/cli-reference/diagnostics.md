---
title: Diagnostics & Introspection
description: Commands for validating workspace health, linting conventions, and inspecting the module dependency graph and capability registry.
---

Commands for diagnosing workspace health, linting convention compliance, and introspecting the module graph and capability bindings. These commands are read-only or report-only — they do not modify workspace state.

## `winter doctor`

Run preflight checks across core probes, the optional workspace probe, and each extension's probes. Exit `0` unless something fails (warnings allowed).

```bash
winter doctor [--json]
```

```bash
winter doctor
```

## `winter lint`

Run winter-ecosystem *convention* checks — path notation, agent frontmatter, module boundaries — as opposed to `winter doctor`, which checks workspace health. `winter lint` is a dispatcher: it runs built-in core checks bundled with the CLI (currently module extractability, which enforces dependency direction) plus lint scripts contributed by installed extensions (and an optional workspace-level one) over the selected scope, and aggregates `pass` / `warn` / `fail` findings with `file:line`. The core checks always run; the contributed checks live in the extensions and workspace. Exit `0` unless something fails (warnings allowed).

```bash
winter lint            # the feature env you're in (every env, if outside one)
winter lint <repo>     # one project repo (its source checkout)
winter lint <env>      # every project worktree in a feature env
winter lint --all      # every env's project worktrees
winter lint --changed  # only the dirty / un-pushed files in the current repo
winter lint --json     # NDJSON event stream
```

Lint targets the project repos developed in feature environments — not the workspace root or the standalone extension clones.

## `winter graph`

Print the module dependency graph declared in each installed extension's `winter-ext.toml` `requires` field. Every installed module that ships a `winter-ext.toml` becomes a node; its `requires` list becomes its edges. A read-only data command with a stable JSON contract; lint checks consume it via `$WINTER_CLI graph --json` to reason about dependencies without re-parsing manifests.

```bash
winter graph            # human-readable `module → deps` listing
winter graph --json     # {module: [requires...]} adjacency map
```

## `winter capabilities` {#winter-capabilities}

Read-only introspection of the capability registry. Lists every known slot, which extension is bound to it, how the binding was determined (explicit, implicit, ambiguous, or invalid), and whether each candidate's entrypoint file resolves on disk. Always exits `0` — misconfiguration is reported here; `winter doctor` is what fails on it.

```bash
winter capabilities           # human-readable per-slot binding listing
winter capabilities --json    # JSON array, one object per known slot
```

See [config.toml Reference → Capability registry](/winter-docs/cli-reference/config/#capability-registry) for the config keys and resolution rules.
