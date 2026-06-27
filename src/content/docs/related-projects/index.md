---
title: Related Projects
description: Projects that integrate with Winter but are neither installable workspace extensions nor opinionated harness examples.
---

Related projects enrich the Winter ecosystem but sit in a different category from [extensions](/winter-docs/extensions/) and [examples](/winter-docs/examples/). Understanding the distinctions:

| Category | What it is | How it integrates |
|----------|------------|-------------------|
| **[Extension](/winter-docs/extensions/)** | A standalone repository a workspace installs via `[[standalone_repository]]` in `config.toml`. Contributes skills, agents, lifecycle hooks, `winter doctor` probes, and `winter lint` checks through a `winter-ext.toml` manifest. | Installed and reconciled by `winter ws init`; surface accessible through the `winter` CLI. |
| **[Example](/winter-docs/examples/)** | The maintainer's own opinionated implementation of conventions or a workflow — installable and usable as-is, but swappable. A concrete reference rather than a generic capability. | Installs like an extension but is the maintainer's own take; fork or replace with your own. |
| **Related project** | A tool or integration that complements Winter workspaces without being installed as a workspace extension. It does not ship a `winter-ext.toml` manifest, is not reconciled by `winter ws init`, and does not appear in the workspace's extension graph. | Used alongside Winter — typically as a user-level tool, editor integration, or external service — and linked to from this section for discoverability. |

## In this section

- **[winter-nvim](/winter-docs/related-projects/winter-nvim/)** — Neovim integration for Winter workspaces: a fuzzy-finder over feature-environment worktrees, a workspace status dashboard, and a cross-repo diff viewer. It reads workspace state from inside Neovim but does not change it.
