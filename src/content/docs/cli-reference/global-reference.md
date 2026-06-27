---
title: Global Reference
description: Root flags that apply to every winter command, and a pointer to the config.toml reference.
---

Root flags that apply to every `winter` command regardless of subcommand.

## Root flags

`winter --version` prints the installed CLI version (read from package metadata) and exits; `winter --help` lists every command and root flag.

```bash
winter --version
```

| Flag | Meaning |
|------|---------|
| `--version` | Print the installed CLI version and exit. |
| `--help` | List every command and root flag. |
| `--winter=PATH` | Run an in-development copy of the CLI from `PATH` instead of the installed one. Must be the first argument. Example: `winter --winter=./alpha/winter ws status`. |
| `--json` | Emit machine-readable output. Accepted by most commands; produces a stable, versioned JSON or NDJSON format. |

## Configuration file

For the full schema of the workspace configuration file (`.winter/config.toml`) — top-level keys, port allocation, `[[project_repository]]`, `[[standalone_repository]]`, `[keybindings]`, `[capabilities]`, provision manifests, and extension manifest fields — see the **[config.toml Reference](/winter-docs/cli-reference/config/)**.
