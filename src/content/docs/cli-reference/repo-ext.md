---
title: Repository & Extension Management
description: Commands for adding repos and scaffolding or verifying extensions — winter repo and winter ext.
---

Commands for managing project repositories and winter extensions in the workspace. Repository configuration lives in [`[[project_repository]]`](/winter-docs/cli-reference/config/#project_repository) and [`[[standalone_repository]]`](/winter-docs/cli-reference/config/#standalone_repository) tables in the [config.toml Reference](/winter-docs/cli-reference/config/).

## `winter repo` — repositories

### `repo list`

List all project and standalone repositories.

```bash
winter repo list
```

### `repo add`

Add a repository to the config (`--local` writes the gitignored overlay instead).

```bash
winter repo add URL [--standalone] [--ref REF] [--name N] [--main-branch B] [--cmd C] [--pinned] [--path P] [--prefix P] [--git-exclude E] [--local]
```

- `--standalone` — add as a standalone repo instead of a project repo.
- `--ref REF` — pin the standalone repo to a branch, tag, or commit (standalone only; see `[[standalone_repository]]` in the [config reference](/winter-docs/cli-reference/config/#standalone_repository)).

```bash
winter repo add git@github.com:org/app.git --name app --cmd "pnpm install"
winter repo add git@github.com:org/ext.git --standalone --ref v1.2.0 --path .winter/ext/myext
```

### `repo remove`

Remove a repository entry from the config.

```bash
winter repo remove project/app
```

## `winter ext` — extension management

### `ext verify`

Verify that an extension conforms to the service capability spec. Runs golden invocations from the bundled spec and reports each check as a pass or fail. Exits non-zero if any check fails.

```bash
winter ext verify EXTENSION [--json]
```

`EXTENSION` is either the name of an installed standalone extension (as declared in `.winter/config.toml`) or a local path to an extension directory. The extension's `winter-ext.toml` must declare a service entrypoint via `[provides] service` (or the deprecated `orchestrate_services` alias).

```bash
winter ext verify winter-service-tmux         # by installed name
winter ext verify ./my-ext/                   # by local path
winter ext verify winter-service-tmux --json  # machine-readable results
```

### `ext new`

Scaffold a new extension that implements a capability slot. Generates a `winter-ext.toml`, an `index.md` skeleton, and a refuse-all stub entrypoint that passes `winter ext verify` out of the box. The action set and exit codes in the stub are derived from the bundled capability spec.

```bash
winter ext new NAME --capability SLOT [--dir DIR] [--force]
```

- `NAME` — the extension name (used in `winter-ext.toml` and as the default output directory).
- `--capability SLOT` — the capability slot to implement (e.g. `service`). Required.
- `--dir DIR` — output directory (default: `<cwd>/<name>/`; relative paths resolved against cwd).
- `--force` — overwrite a non-empty existing output directory.

```bash
winter ext new my-orchestrator --capability service
winter ext new my-orchestrator --capability service --dir /path/to/dir
```
