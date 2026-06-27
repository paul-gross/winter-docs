---
title: TUI Plugin Examples
description: Practical plugin shapes beyond the status badge — worktree repo decorators, keyboard actions, and multi-decorator compositions.
---

The [authoring guide](/winter-docs/tui-plugins/authoring/) covers the full `PluginRegistration` surface and walks through a single status badge. This page collects additional plugin shapes drawn from real implementations. All examples import from the `winter_plugin_api` package — see the [authoring guide](/winter-docs/tui-plugins/authoring/#typing-the-contract) for how to declare the dev dependency.

## Shape 1: worktree repo decorator

A `worktree_repo_decorator` fires once per repo per dashboard refresh and writes into `repo_status.extensions[<key>]`. This is the right hook for badges on individual repository rows — for example, showing whether a repo has uncommitted changes or a stale remote.

```python
import subprocess
from pathlib import Path

import dataclasses
from winter_plugin_api import IWinterPlugin, IWorktreeRepoStatusView, PluginRegistration


def create_plugin() -> IWinterPlugin:
    return DirtyRepoPlugin()


@dataclasses.dataclass
class DirtyRepoPlugin:
    name: str = "dirty-repo"

    def register(self, config: object) -> PluginRegistration:
        return PluginRegistration(worktree_repo_decorators=[dirty_badge])


def dirty_badge(repo_status: IWorktreeRepoStatusView, repo_path: Path) -> None:
    try:
        result = subprocess.run(
            ["git", "-C", str(repo_path), "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        dirty = bool(result.stdout.strip())
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        dirty = False
    repo_status.extensions["dirty"] = "✎" if dirty else ""
```

Key points:

- The `repo_path` argument is the absolute path to the worktree's repo directory — use it to scope git commands.
- Return gracefully on any subprocess failure; a decorator that raises blanks its cell on every refresh.
- Set the extension value to an empty string (`""`) for "nothing to show" — omitting the key leaves it unset, which is equivalent.

## Shape 2: environment decorator with config

A plugin's `register(config)` receives parsed config from `config.toml` next to `plugin.py`. Use it for thresholds, labels, or feature flags rather than hardcoding them.

```python
import dataclasses
from pathlib import Path

from winter_plugin_api import IEnvironmentStatusView, IWinterPlugin, PluginRegistration


def create_plugin() -> IWinterPlugin:
    return AgePlugin()


@dataclasses.dataclass
class AgePlugin:
    name: str = "env-age"
    _warn_days: int = 7

    def register(self, config: object) -> PluginRegistration:
        cfg = config if isinstance(config, dict) else {}
        self._warn_days = int(cfg.get("warn_days", 7))
        return PluginRegistration(environment_decorators=[self._age_badge])

    def _age_badge(self, env_status: IEnvironmentStatusView, env_path: Path) -> None:
        # Read a sentinel file's mtime to estimate env age.
        sentinel = env_path / ".winter" / "created_at"
        try:
            import time
            age_days = (time.time() - sentinel.stat().st_mtime) / 86400
            env_status.extensions["age"] = "⚠" if age_days > self._warn_days else ""
        except OSError:
            pass
```

The companion `config.toml` (placed next to `plugin.py`) controls the threshold:

```toml
warn_days = 14
```

## Shape 3: keyboard action

`tui_actions` bind a callable to a key for workspace-, environment-, or repo-scoped actions. The action fires when the user presses the key while the relevant dashboard item is focused.

```python
import dataclasses
import subprocess
from winter_plugin_api import (
    ActionInvocation,
    ActionScope,
    IWinterPlugin,
    PluginRegistration,
    TuiAction,
)


def create_plugin() -> IWinterPlugin:
    return FetchAllPlugin()


@dataclasses.dataclass
class FetchAllPlugin:
    name: str = "fetch-all"

    def register(self, config: object) -> PluginRegistration:
        return PluginRegistration(
            tui_actions=[
                TuiAction(
                    name="fetch-all",
                    key="f",
                    description="Fetch all repos",
                    scope=ActionScope.feature_environment,
                    handler=self._fetch_all,
                )
            ]
        )

    def _fetch_all(self, ctx: ActionInvocation) -> None:
        for worktree in ctx.worktrees:
            subprocess.run(["git", "-C", str(worktree.path), "fetch", "--all"], timeout=30)
```

Notes:

- `key` is the **default** binding — users can remap it in `config.toml` via `[keybindings.bindings]` using the id `plugin.<name>`.
- Actions that take more than a moment should be non-blocking or should give visible feedback; the dashboard does not freeze for long-running actions.

:::caution[`commands` is not wired yet]
`PluginRegistration.commands` (for `winter` CLI subcommands) is reserved — plugin-supplied subcommands are not yet dispatched by the CLI. Ship behavior through the dashboard surfaces above until that lands.
:::

## Shape 4: multi-decorator composition in one plugin

A single plugin can register multiple decorators at once. Register them all in the `PluginRegistration` return value.

```python
import dataclasses
from pathlib import Path

from winter_plugin_api import (
    IEnvironmentStatusView,
    IWinterPlugin,
    IWorktreeRepoStatusView,
    PluginRegistration,
)


def create_plugin() -> IWinterPlugin:
    return CompositePlugin()


@dataclasses.dataclass
class CompositePlugin:
    name: str = "composite"

    def register(self, config: object) -> PluginRegistration:
        return PluginRegistration(
            environment_decorators=[env_service_badge],
            worktree_repo_decorators=[repo_dirty_badge],
        )


def env_service_badge(env_status: IEnvironmentStatusView, env_path: Path) -> None:
    # ... badge logic for env-level status
    env_status.extensions["svc"] = "●"


def repo_dirty_badge(repo_status: IWorktreeRepoStatusView, repo_path: Path) -> None:
    # ... badge logic for per-repo status
    repo_status.extensions["dirty"] = ""
```

## Dotfiles-sourced examples

The maintainer's dotfiles contain additional real-world plugin implementations. These will be added here once their source paths are confirmed and the content is accessible; quoting private dotfiles without a confirmed public source would present unverified content as a maintained contract.

**Placeholder — dotfiles source path pending.** When the source path is provided, this section will include the full plugin implementation as found in the dotfiles, with a direct link to the source rather than an inline copy.

## Reference links

- **Contract package**: [`winter-plugin-api`](https://github.com/paul-gross/winter-plugin-api) — the versioned source of truth for all types imported above.
- **Plugin author contract**: [`winter-harness:/architecture/plugin-author.md`](https://github.com/paul-gross/winter-harness/blob/master/architecture/plugin-author.md)
- **Worked status badge**: [`winter-service-tmux:/plugin.py`](https://github.com/paul-gross/winter-service-tmux/blob/master/plugin.py)
- **Authoring guide**: [Authoring a TUI Plugin](/winter-docs/tui-plugins/authoring/)
