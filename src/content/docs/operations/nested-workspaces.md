---
title: Nested Workspaces
description: Host a winter workspace inside another — how ws init, ws destroy, and ws status drive a nested workspace, how it shares the outer environment's ports and service names, and what it must gitignore.
---

A **nested workspace** is a winter workspace that lives inside another one. You declare it as a project repository with
`nested = true`; winter worktrees it into every environment of the outer workspace like any other project repo, then
drives each copy as a workspace in its own right — initializing it, reporting on it, and tearing it down with the
environment that holds it.

Reach for this when one unit of work needs a whole workspace of its own: each outer environment then carries a private
copy of that workspace, with its own repositories and feature environments, and nothing collides with the copy in
another environment.

```toml
[[project_repository]]
name = "lab"
url = "git@github.com:org/lab-workspace.git"
nested = true
envs = 3
cmd = ["<bootstrap the nested workspace's CLI>"]
```

The keys are in the [config reference](/winter-docs/cli-reference/config/#nested-workspaces-nested-envs-inherit_local).
The source checkout at `projects/lab/` is cloned and its `cmd` runs there as for any project repo, but it is never
initialized as a workspace — only the per-environment copies are.

## `ws init`

`winter ws init alpha` does the following for the nested repo, after the usual worktree setup:

1. Creates or reuses the worktree `alpha/lab/` and runs the entry's `cmd` there. The command runs with a scrubbed
   environment: none of the outer CLI's `WINTER_*` variables (apart from the log-level and telemetry settings), no
   `VIRTUAL_ENV`, and no outer virtualenv on `PATH`. It sees the environment the nested workspace's own CLI will run in,
   so use it to bootstrap whatever that CLI needs.
2. Writes the outer environment's port band, a service prefix, and the keys `inherit_local` names into
   `alpha/lab/.winter/config.local.toml`. This happens on every run, so the nested workspace tracks the outer
   environment.
3. Runs `winter ws init` inside `alpha/lab/`, using the nested workspace's own CLI.

A failing `cmd` skips the nested init, a delegation that does not fit the band fails the environment before the nested
init runs, and a failing nested init fails the environment.

The nested init is bare: it clones the nested workspace's own projects but creates none of its feature environments.
Create those from inside the nested root with its own `winter ws init <nested-env>`.

## Ports and service names

Left alone, a nested workspace would compute ports from its own committed `base_port` and name its services under its
own `service_prefix` — the same ports and names as every other copy of it on the host. So step 2 delegates the outer
environment's namespace to it:

| Key                  | Written as                                         | When                       |
| -------------------- | -------------------------------------------------- | -------------------------- |
| `base_port`          | the outer environment's `WINTER_PORT_BASE`         | always                     |
| `service_prefix`     | `<outer service_prefix>-<env>`, e.g. `outer-alpha` | always                     |
| `env_aliases`        | `[]`                                               | when the entry sets `envs` |
| `envs_per_workspace` | `envs + 1`                                         | when the entry sets `envs` |

The nested workspace's port band therefore starts at the outer environment's own, and every nested environment's
services carry the outer environment's name. Winter sets only these keys; everything else in the nested overlay is
preserved. Do not edit them by hand — they are rewritten on every `ws init`.

**`envs = N` means N usable nested environments.** The slot right after index 0 is a reserved buffer that is never given
to an environment, so N usable environments need `envs_per_workspace = N + 1`. With `envs` unset, winter writes neither
key and the nested workspace keeps its own settings. Removing `envs` after it was set does not undo the earlier writes:
winter cannot tell its own values from yours, so the last-written `env_aliases` and `envs_per_workspace` stay in the
nested `config.local.toml` until you delete them by hand.

**The footprint must fit the outer band.** A nested workspace can use `(envs_per_workspace + 1) × ports_per_env` ports,
using its own `ports_per_env`. With `envs = N` that is `(N + 2) × ports_per_env`. When this exceeds the outer
`ports_per_env`, `ws init` refuses that environment, names both numbers, writes nothing, and does not run the nested
init. For example, an outer `ports_per_env = 100` and a nested `ports_per_env = 20` fit `envs = 3` (`5 × 20 = 100`) and
refuse `envs = 4` (`120`). Shrink `envs` or raise the outer `ports_per_env`.

Shrinking `envs` after the nested workspace holds environments can leave an existing nested environment's index outside
the new range. `winter doctor` warns about an out-of-range index in the nested workspace.

For the port scheme itself, see [Feature Environments & Worktrees](/winter-docs/operations/feature-environments/) and
the [port allocation](/winter-docs/cli-reference/config/#port-allocation) reference.

## What `inherit_local` passes down

A nested workspace starts with no local overlay, so none of the outer workspace's machine-local settings reach it — not
even the git identity its commits need. `inherit_local` names the top-level keys or tables of the outer
`.winter/config.local.toml` that `ws init` copies into the nested one:

- The default is `["git"]`, which passes the whole `[git]` table. `[]` copies nothing.
- The source is the outer overlay as written, never the merged config, and a named key the overlay does not hold is
  skipped.
- `[[project_repository]]` and `[[standalone_repository]]` arrays are never copied, even when named.
- A copied table replaces the nested file's table of the same name. Keys the nested file already holds and you did not
  name stay as they are.
- The delegated port and prefix keys win over an inherited key of the same name.

The outer overlay can hold secrets and settings meant only for the outer workspace, which is why nothing is copied
unless you name it.

## `ws destroy`

`winter ws destroy alpha` destroys every feature environment the nested workspace holds, through the nested workspace's
own CLI and while the outer environment is still whole. Each nested destroy runs its own provision teardown and
`on_env_destroy` hooks, so the nested environments' services and provisioned resources go with them. Only then does the
outer teardown proceed.

The destroy refuses, unless you pass `--force`, when:

- a nested environment has a dirty worktree;
- the nested workspace cannot be read, for example because its `winter` does not resolve the nested root;
- the nested workspace holds work that exists nowhere else. The nested workspace's repositories live inside the outer
  worktree, so removing it deletes them, and a nested `ws destroy` keeps each environment's branch in those
  repositories. The refusal counts:
  - in a nested environment's worktree, commits its upstream lacks, or commits beyond the main branch on a branch with
    no upstream to hold them;
  - in a nested source checkout or standalone, uncommitted changes, commits ahead of origin, commits on any local branch
    that no remote-tracking branch holds (for example a branch an earlier nested `ws destroy` kept), and stashes.

  A branch that is pushed to its upstream but not yet merged does not count. The refusal names each place and why. Push
  the commits and branches, commit and push or drop the changes and stashes, or pass `--force` to discard it all.

If a nested destroy fails, the outer environment keeps its worktree unless `--force` is given.

Once the nested environments are gone, winter also stops the nested workspace's workspace-scope services, such as a
shared database, by running `winter service down workspace` inside it. This happens only when the nested workspace binds
a `service` capability, and before the outer worktree is removed. A failure aborts the destroy unless you pass
`--force`.

`--dry-run` lists each nested environment that would be destroyed, and that service stop, and runs nothing destructive.

## `ws status`

`winter ws status` reads each nested workspace and prints a line under the environment's repo table, for example
`lab (nested): 2 envs, dirty, unpushed`, or `lab (nested): unreadable — <reason>` when the read fails. `--json` carries
the same information as a `nested` object on the worktree.

A nested workspace with a dirty environment, or one that could not be read, counts as a dirty worktree for the exit
code. Unpushed nested work does not change the exit code; it is what `ws destroy` refuses on. The read is recursive, so
workspaces nested inside the nested workspace carry up the same way.

Status also counts, for each project source checkout and standalone, the commits that no remote-tracking branch holds
(`local_only_commits`) and the stash entries (`stashes`), as
[`ws status`](/winter-docs/cli-reference/workspace-lifecycle/#ws-status) describes for every workspace. In a nested
workspace they count as unpushed work, so `ws destroy` refuses on them.

## Files the nested workspace must gitignore

Winter keeps the nested workspace's `projects/`, its feature-environment directories, and its projected skills and
agents out of `git status` itself. The nested repository must gitignore every other file that its `ws init` and CLI
install write at its root. Otherwise the outer worktree reads as dirty and `ws destroy` refuses. Winter's own are:

```gitignore
/.winter/config.local.toml
/.winter/state.toml
/AGENTS.winter.md
```

Add whatever the nested workspace's CLI install writes there besides.

## The wrong-workspace guard

Every call into a nested workspace runs `winter` from `PATH` with the nested root as its working directory. Before the
first call, winter checks that the root holds `.winter/config.toml` and that `winter ws status --json` there reports the
same root. A `winter` that resolves any other workspace, such as the outer one, is refused and nothing else runs, so a
misconfigured `PATH` cannot point a destroy or an init at the wrong workspace.

:::note[Canonical source] The exact behavior is documented for agents in
[`context/winter-cli/configuration/repositories.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/configuration/repositories.md)
and
[`context/winter-cli/configuration/ports-and-environments.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/configuration/ports-and-environments.md)
in the `winter` repo. :::
