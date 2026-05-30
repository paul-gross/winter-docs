---
title: winter-workspace
description: The meta-workspace winter is built in — where the framework, its CLI, and its extensions are developed. A worked example of an assembled workspace, not a starter template.
---

**[winter-workspace](https://github.com/paul-gross/winter-workspace)** is the **meta-workspace**: the winter workspace in which winter itself is built. The framework's Python CLI, the documentation site, and every extension (`winter-workflow`, `winter-harness`, `winter-service-tmux`, and the rest) are developed here — each cloned as a project under this one workspace and worked on in its feature environments. It is winter building winter: the maintainer's own assembled workspace, pre-wired to those repos and published as a worked example of what a real winter workspace looks like, not a template to clone and run.

## What it is

A workspace root: the `.winter/config.toml` that declares the project repos and standalone extensions, the committed `CLAUDE.md` that orients an agent to the layout and the env model, the `ai/` docs that capture this workspace's conventions, and the Greek-letter feature environments where work actually happens. Everything that makes winter a *workspace* — rather than a CLI or an extension — is shown here in its assembled form.

## Why it's an example

The workspace carries the maintainer's specific repos, prefixes, and choices. Cloning it gives you *their* setup, not yours. Its value is as a reference: it shows how the pieces compose — how `config.toml` wires standalones, how `CLAUDE.md` points at the installed extensions' surfaces, how feature environments are named and ported, how project-specific setup is captured in `ai/`. You read it to see the shape, then assemble your own.

## How to learn from it

- Study `.winter/config.toml` for how project repos and extensions are declared, then write your own.
- Read the committed `CLAUDE.md` for what belongs in a workspace's root context — workspace operation, the env model, and pointers to each installed extension's runtime surface.
- Follow the [Quick Start](/winter-docs/getting-started/quick-start/) to stand up a workspace of your own rather than cloning this one.

:::note[Canonical source]
[`winter-workspace`](https://github.com/paul-gross/winter-workspace) — the maintainer's development workspace. Not a starter template; see the [Quick Start](/winter-docs/getting-started/quick-start/) to create your own.
:::
