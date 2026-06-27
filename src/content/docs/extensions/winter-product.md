---
title: winter-product
description: A prioritized product backlog, an active work area, and the agents and skills that move items between them.
---

**[winter-product](https://github.com/paul-gross/winter-product)** adds product planning to a winter workspace: a prioritized backlog, an active work area, an archive, and the conventions, agents, and skills that move items through them.

## What it contributes

### The backlog model

Work lives in three areas, addressed via the `winter-product:` path notation:

| Area | Contents |
|------|----------|
| `backlog/` | A prioritized queue, bucketed by horizon: `01-now/`, `02-next/`, `05-near/`, `10-future/`. |
| `work/` | Active work — items promoted from the backlog, one directory per item. |
| `archive/` | Completed work and TODOs, date-prefixed. |

### Item types

Each backlog item is a single file named `<name>.<type>.md`:

- **`.idea.md`** — a rough concept, not yet fleshed out.
- **`.todo.md`** — small, concrete, already well-defined.
- **`.work.md`** — a product-level plan, potentially multi-phase.

### Lifecycle

Items flow `backlog/ → work/ → archive/`:

1. **Backlog** — a single file under `backlog/<bucket>/`.
2. **Work** — promoted to `work/<name>/`. A `.work.md` item is fleshed out with `00-overview.md`, optional `.tech.md` approach docs, and numbered phase documents; a `.todo.md` typically stays a single file.
3. **Archive** — moved to `archive/yyyy-MM-dd-<name>/` when the work merges to main.

### Agents & skills

- **`product-specialist`** agent — shapes work items.
- **`product-engineer`** agent — writes `.tech.md` technical-approach docs.
- **`plan-reviewer`** agent — cold-reviews a promoted work item (overview, tech approach, phases, or a backlog item) against the planning specs in `winter-product:/context/` and returns a structured verdict (ready / needs work), must-fix findings with spec citations, and open questions. Spawn after writing or refining a plan, before implementation begins.
- **`/wp-refine`** — the primary path from backlog to work-ready, including the technical approach.
- **`/wp-todo`** — the fast path for dropping a new TODO into the backlog.
- **`/wp-plan-review`** — spawns a fresh-context `plan-reviewer` agent over a named work item or backlog item and relays the verdict and findings. The fresh context is the point: use this skill rather than reviewing in the current session. Argument: `<item-name>` (kebab-case name matching a directory under `work/` or a file under `backlog/`).

## When to adopt

Adopt winter-product when you want a lightweight, file-based backlog that lives in git alongside the code and is legible to agents — so the same agents that plan work can pick it up and implement promoted items directly from `work/`.

## How to configure

```toml
[[standalone_repository]]
name = "winter-product"
url = "git@github.com:paul-gross/winter-product.git"
path = ".winter/ext/product"
```

## Key conventions

- **One file per backlog item**, kebab-case, typed by extension (`.idea` / `.todo` / `.work`).
- **Promote before fleshing out** — detailed overviews and phase docs belong in `work/`, not the backlog.
- **Archive on merge** — completed items move to the date-prefixed archive when their work lands on main.

:::note[Canonical source]
[`winter-product`](https://github.com/paul-gross/winter-product) — see its [`index.md`](https://github.com/paul-gross/winter-product/blob/master/index.md) and [`context/`](https://github.com/paul-gross/winter-product/tree/master/context) planning conventions.
:::
