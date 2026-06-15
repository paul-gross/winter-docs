---
title: Authoring a TUI plugin
description: Extend the winter dashboard and CLI with a plugin.py — contribute status badges, TUI screens, keybound actions, and winter subcommands.
---

A **TUI plugin** extends the `winter` dashboard from outside the CLI's own source tree. A plugin can paint status badges onto the dashboard, add full TUI screens, and bind keyboard actions.

This is a different extension point from a [winter extension](/winter-docs/extensions/). An extension integrates with the *workspace* — it ships skills, agents, and `on_env_init` / `on_env_destroy` lifecycle hooks via a `winter-ext.toml` manifest. A TUI plugin integrates with the *running `winter` tool* — its dashboard and command surface. The two are independent, and one repository can ship both: `winter-service-tmux` declares lifecycle hooks in its manifest *and* ships a `plugin.py` that badges each environment with its tmux-session state.

## The shape of a plugin

A plugin is a single `plugin.py` exposing a module-level `create_plugin()` factory. The factory returns an object with a `name` and a `register()` method; `register()` hands back a `PluginRegistration` describing everything the plugin contributes.

```python
import dataclasses


def create_plugin():
    return MyPlugin()


@dataclasses.dataclass
class MyPlugin:
    name: str = "my-plugin"

    def register(self, config):
        from winter_cli.plugins.types import PluginRegistration
        return PluginRegistration(
            environment_decorators=[my_badge],
        )
```

`register(config)` receives the parsed contents of a `config.toml` sitting next to `plugin.py` (an empty dict if there is none). Do all of your wiring here and return the registration — it is called once, when the plugin is discovered.

:::tip[Why the import is inside `register`]
Importing `winter_cli` lazily inside the method keeps `plugin.py` importable on its own — e.g. when a type checker or test loads the file without the CLI on `sys.path`. The worked example below does the same.
:::

## Where plugins live

The loader discovers plugins from three locations, **in priority order** — the first plugin found under a given name wins, so a workspace can shadow an extension's plugin:

1. **Workspace-local** — `<workspace>/.winter/plugins/<name>/plugin.py`
2. **User-global** — `~/.config/winter/plugins/<name>/plugin.py`
3. **Installed extensions** — `<standalone_repo>/plugin.py`, so an extension ships its dashboard plugin alongside its hooks with nothing to copy

A plugin that has no `create_plugin()`, or whose `create_plugin()` / `register()` raises, is logged and skipped — a single broken plugin never takes the whole CLI offline. Decorators run on every dashboard refresh, so guard them too: a decorator that raises would blank its cell repeatedly. Catch failures and degrade to a neutral badge (the worked example treats a missing `tmux` as "stopped").

## What a plugin can contribute

Every field of `PluginRegistration` is optional — populate only what you ship:

| Field | Contributes |
|-------|-------------|
| `worktree_repo_decorators` | badges on a repo's row in the dashboard |
| `environment_decorators` | badges on a feature-environment header |
| `tui_screens` | full dashboard screens |
| `tui_actions` | keybound actions, each scoped to the workspace, an environment, or a worktree. A `TuiAction.key` is the **default** binding — users can remap it from `[keybindings.bindings]` in `config.toml` via the id `plugin.<name>` |
| `metadata` | free-form data about the plugin |
| `commands` | `click.Command` objects — **reserved**: the loader collects these, but they are not yet attached to the `winter` CLI, so plugin-supplied subcommands do not run today |

:::caution[`commands` is not wired yet]
The `commands` field exists on the contract, but the CLI does not currently register plugin commands — click resolves the subcommand before the plugin registry is built. Treat `commands` as reserved until that lands; ship behavior through the dashboard surfaces above.
:::

## Worked example: a status badge

Decorators are the most common contribution. A decorator is a callable `(status, path) -> None` that **mutates** the status object's `extensions` dict in place; whatever you store there is appended to the rendered cell, joined by spaces. Keep the key short and unique to your plugin.

`winter-service-tmux` ships exactly this — an environment decorator that stamps a one-character badge showing whether the env's tmux session is running:

```python
def create_plugin():
    return TmuxStatusPlugin()


@dataclasses.dataclass
class TmuxStatusPlugin:
    name: str = "winter-service-tmux"

    def register(self, config):
        from winter_cli.plugins.types import PluginRegistration
        return PluginRegistration(environment_decorators=[tmux_session_badge])


def tmux_session_badge(env_status, env_path) -> None:
    session = f"{env_status.environment.workspace.session_prefix}-{env_status.environment.name}"
    try:
        result = subprocess.run(
            ["tmux", "has-session", "-t", session],
            capture_output=True,
            timeout=2,
        )
        running = result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        running = False
    env_status.extensions["wst"] = "●" if running else "○"
```

There are two decorator flavors, each firing once per refresh:

- **`worktree_repo_decorators`** run once per repo — write to `repo_status.extensions[<key>]` for a badge on that repo's row.
- **`environment_decorators`** run once per environment — write to `env_status.extensions[<key>]` for a badge on the env's column header and detail screen.

## Typing the contract

New plugins can annotate `create_plugin() -> IWinterPlugin` to typecheck against the contract. The Protocols and `PluginRegistration` are exported from `winter_cli.plugins.types`, and the canonical, always-current reference — including the full set of pinned public names — is the harness convention:

- **Plugin author contract**: [`winter-harness/architecture/plugin-author.md`](https://github.com/paul-gross/winter-harness/blob/master/architecture/plugin-author.md)
- **Worked example source**: [`winter-service-tmux/plugin.py`](https://github.com/paul-gross/winter-service-tmux/blob/master/plugin.py)
- **Contract definitions**: [`winter_cli/plugins/types.py`](https://github.com/paul-gross/winter/blob/master/tools/winter-cli/src/winter_cli/plugins/types.py)
