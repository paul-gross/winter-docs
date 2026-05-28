---
title: config.toml Reference
description: Every key in .winter/config.toml and the .winter/config.local.toml overlay — types, defaults, and behavior.
---

Winter reads two files and merges them: the committed workspace config and a gitignored per-user overlay.

- `.winter/config.toml` — the committed workspace config (repo list, excludes, defaults).
- `.winter/config.local.toml` — a gitignored overlay for per-user settings. It uses the same schema and overrides the shared config key by key.

## Top-level keys

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `main_branch` | string | `"main"` | Workspace-default main branch. Each `[[project_repository]]` may override it. |
| `session_prefix` | string | — | tmux session prefix used by the service-orchestration extension. |
| `adopt_extensions` | string | `"winter"` | How aggressively standalone repos contribute skills/agents: `winter`, `all`, or `none` (see below). |
| `doctor` | string (path) | — | Optional workspace-level `winter doctor` probe script, relative to the workspace root, must be executable. |
| `git_excludes` | string[] | `[]` | Entries appended to every repo's `.git/info/exclude` on `winter ws init`. |

### `adopt_extensions` modes

| Value | Behavior |
|-------|----------|
| `winter` (default) | Process only standalone repos that have a `winter-ext.toml`. SKILL.md frontmatter is strictly validated. |
| `all` | Process any standalone repo with a `skills/`, `agents/`, `.claude/skills/`, or `.claude/agents/` directory, manifest or not. Frontmatter validation downgrades from refuse to warn. |
| `none` | Skip extension processing entirely. Standalone repos are still cloned; no symlinks are created. |

## `[[project_repository]]`

Repos cloned into `projects/` and worktreed into Greek-letter environment directories. Entries appear in CLI/TUI output in declared order, so list high-priority repos first.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `url` | string | — (required) | Clone URL. |
| `name` | string | trailing path segment of `url`, `.git` stripped | Directory under `projects/` and the user-facing label everywhere. |
| `main_branch` | string | top-level `main_branch` | Per-repo override of the main branch. |
| `cmd` | string[] | `[]` | Commands run after clone and in every worktree (e.g. `["pnpm install"]`). |
| `pinned` | bool | `false` | Track `origin/<main>`, skip feature branching, exclude from `push` by default. |
| `git_excludes` | string[] | `[]` | Per-repo excludes, merged with the workspace-wide list. |

```toml
[[project_repository]]
name = "app-web"
url = "git@github.com:org/app-web.git"
cmd = ["pnpm install"]

[[project_repository]]
name = "shared-tools"
url = "git@github.com:org/shared-tools.git"
pinned = true
```

## `[[standalone_repository]]`

Repos cloned at the workspace root (or a configured `path`), with no worktree and no feature branching. Used for winter extensions and auxiliary repos.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `url` | string | — (required) | Clone URL. |
| `name` | string | derived from `url` | Repo name; default clone directory. |
| `path` | string | `name` | Clone location, relative to the workspace root. |
| `prefix` | string | from `winter-ext.toml`/name | Symlink-prefix override for an extension's skills/agents. |

```toml
[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"
```

## Local overlay (`.winter/config.local.toml`)

Same schema as the shared config; keys override key by key. Most commonly it carries your git identity, which winter applies to every repo it manages during `winter ws init`:

```toml
[git]
user.name = "Jane Doe"
user.email = "jane@example.com"
```

You can also declare additional `[[project_repository]]` / `[[standalone_repository]]` entries here that you don't want committed to the shared config.

## Implicit workspace repo

The `workspace` repo is discovered implicitly — it is not declared in either file. Winter detects it from the filesystem as the repo the CLI is invoked from.

## Extension manifests

Per-extension configuration lives in each extension's own `winter-ext.toml`, not in `config.toml`. See the [Extensions](/winter-docs/extensions/) guides.

:::note[Canonical source]
Full configuration reference for agents: [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md).
:::
