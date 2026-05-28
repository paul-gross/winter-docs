---
title: Python Conventions
description: The winter-harness Python conventions — domain modeling, error handling, DI, repository pattern, testing, linting, and typechecking.
---

winter-harness ships a convention file for each recurring decision in Python application code. The rule of thumb: **read the file that matches your change before you write code.** Each links to its canonical source in [`winter-harness/python/`](https://github.com/paul-gross/winter-harness/tree/master/python).

## Modeling & structure

| Convention | Read when | Source |
|------------|-----------|--------|
| Domain modeling | Adding a domain type, or refactoring a function with many parameters. | [`domain-modeling.md`](https://github.com/paul-gross/winter-harness/blob/master/python/domain-modeling.md) |
| Module layout | Adding a `core/` cross-cutting protocol or a `modules/<feature>/internal/` adapter. | [`module-layout.md`](https://github.com/paul-gross/winter-harness/blob/master/python/module-layout.md) |

## Failure & I/O

| Convention | Read when | Source |
|------------|-----------|--------|
| Error handling | Writing any function that can fail. | [`error-handling.md`](https://github.com/paul-gross/winter-harness/blob/master/python/error-handling.md) |
| Repository pattern | Touching git, filesystem, or any external I/O. | [`repository-pattern.md`](https://github.com/paul-gross/winter-harness/blob/master/python/repository-pattern.md) |
| Protocol conformance | Adding a Protocol/adapter pair — pin conformance with a typecheck-time sentinel. | [`protocol-conformance.md`](https://github.com/paul-gross/winter-harness/blob/master/python/protocol-conformance.md) |
| Subprocess | Shelling out — `subprocess.run` / `Popen` conventions and error wrapping. | [`subprocess.md`](https://github.com/paul-gross/winter-harness/blob/master/python/subprocess.md) |

## Wiring & observability

| Convention | Read when | Source |
|------------|-----------|--------|
| Dependency injection | Adding a new service or wiring it into the container. | [`dependency-injection.md`](https://github.com/paul-gross/winter-harness/blob/master/python/dependency-injection.md) |
| Logging | Adding a log call, picking a level, or choosing between logger / reporter / print. | [`logging.md`](https://github.com/paul-gross/winter-harness/blob/master/python/logging.md) |

## Quality gates

| Convention | Read when | Source |
|------------|-----------|--------|
| Testing | Adding or refactoring tests — pytest layout, conftest scoping, fake-vs-mock. | [`testing.md`](https://github.com/paul-gross/winter-harness/blob/master/python/testing.md) |
| Linting | Before pushing Python changes, or setting up ruff. | [`linting.md`](https://github.com/paul-gross/winter-harness/blob/master/python/linting.md) |
| Typechecking | Before pushing Python changes, or setting up pyright. | [`typechecking.md`](https://github.com/paul-gross/winter-harness/blob/master/python/typechecking.md) |

## Exemplars

Reference implementations that show the conventions applied:

- [`exemplars/python/repo_pattern.py`](https://github.com/paul-gross/winter-harness/blob/master/exemplars/python/repo_pattern.py) — the repository pattern: an `I`-prefixed Protocol seam, an `internal/` adapter, and factory-injected errors.
- [`exemplars/python/cli-architecture.md`](https://github.com/paul-gross/winter-harness/blob/master/exemplars/python/cli-architecture.md) — a guided tour of how the conventions come together in the winter CLI; read it before adding a new `winter ws` subcommand.

:::note[Canonical source]
[`winter-harness/python/`](https://github.com/paul-gross/winter-harness/tree/master/python). The harness is meant to be corrected in place — if a convention is wrong or stale, fix it where you find it.
:::
