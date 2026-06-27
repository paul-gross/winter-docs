---
title: winter-service-docker
description: Docker Compose-based service orchestration — real container health checks, workspace singletons, and per-env isolation.
---

**[winter-service-docker](https://github.com/paul-gross/winter-service-docker)** provides service orchestration through Docker Compose. Each feature environment runs its own isolated Compose project — separate container namespaces and port assignments — so multiple environments can run the full stack side by side without collision. The extension implements the full `winter service` contract: all service control goes through `winter service <action> <env>`.

## What it contributes

- **`winter service up/down/status/restart/logs <env>`** dispatch, backed by `docker compose`.
- **Per-env isolation** — each environment gets a unique `COMPOSE_PROJECT_NAME` and `WSD_PORT_*` substitution variables, so containers and host ports do not collide across envs.
- **Real container health** — `winter service up <env> --wait` polls Docker's native healthcheck status rather than a fixed sleep, so it is a genuine readiness gate for CI and agent-driven workflows.
- **Workspace-scoped singleton services** — shared services (databases, brokers) that should run once for the whole workspace rather than once per environment can be declared at `scope = "workspace"`. They are started with `winter service up workspace` and shared across all envs.
- A **`winter doctor` probe** that checks two things: the docker daemon is reachable (`docker info`) and the Compose v2 plugin is present (`docker compose version`).

## When to adopt

Use **winter-service-docker** when:

- You want to author dedicated, scope-pure `environment-compose.yaml` (per-env) and `workspace-compose.yaml` (workspace singletons) compose files managed by winter.
- You need genuine container health/readiness — `--wait` using Docker's native healthcheck is more reliable than a fixed sleep.
- You want workspace-singleton services (a shared database, a message broker) running once for all environments.
- Your CI environment can run Docker but not tmux.

Use **winter-service-tmux** when:

- Your services are native processes (not containerized), or containerization adds friction with no benefit.
- You want interactive panes — `log = "pane"` lets you attach to a running service's terminal directly.
- You need per-service restart without rebuilding container images.

The two providers implement the same `winter service` capability slot. Under the multi-provider contract, both can be bound at once (`capabilities.service = ["winter-service-tmux", "winter-service-docker"]`): `winter service up`/`down`/`status` fan out across every bound provider, while each individual service is owned by exactly one provider (winter rejects a duplicate-ownership binding). That makes the two complementary rather than mutually exclusive — run Docker for workspace-level daemons like a database server and tmux for the local application services you iterate on, and a single `winter service up` brings both halves online. To run just one, name only that provider in the `[capabilities]` registration — nothing outside the registration changes.

## Workspace vs feature-environment scope

**Feature-environment scope** (`scope = "project"`, the default) — each `winter service up <env>` starts a Compose project named for that environment. Containers, volumes, and networks are namespaced per env. Destroy the environment and `winter service down <env>` tears the project down cleanly.

**Workspace scope** — declare `scope = "workspace"` for services that are genuinely shared. `winter service up workspace` starts them once; all feature environments connect to the same instance. Use this for stateful services (Postgres, Redis) where running one instance per env is wasteful or where shared state is deliberate.

## Real container health and `--wait`

When you run `winter service up <env> --wait`, winter itself polls the provider's `status` action until no in-scope service reports `unhealthy` — every service must be `healthy` or `unknown`. The wait is entirely winter-side: the provider just answers one status snapshot per poll, mapping each container's Docker healthcheck to that `health` value. The payoff is specific to Docker — because the health comes from real container healthchecks, `--wait` here is a genuine readiness gate (the bundled tmux provider reports `unknown` for every service, so `--wait` does not yet block on it), letting an agent call `winter service up alpha --wait` before running tests without hard-coded sleeps. A container with no `healthcheck` directive reports `unknown` and does not gate.

Declare healthchecks in your Compose file to get the most out of `--wait`:

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 5s
      retries: 10
```

## How to configure

Register the extension in `.winter/config.toml`:

```toml
# .winter/config.toml
[capabilities]
service = "winter-service-docker"

[[standalone_repository]]
name = "winter-service-docker"
url = "git@github.com:paul-gross/winter-service-docker.git"
path = ".winter/ext/service-docker"
```

The extension reads its configuration from a per-extension `config.toml` at `.winter/config/winter-service-docker/config.toml` (resolved via the `WINTER_EXT_CONFIG_DIR` environment variable injected by winter on every dispatch). That manifest declares `[[service]]` entries — the real configuration surface — along with `environment_compose_file` and `workspace_compose_file` keys pointing to the compose files. The default scaffolded layout places both compose files alongside `config.toml` in that same config dir (e.g. `.winter/config/winter-service-docker/environment-compose.yaml`). There is no auto-discovery from the worktree root and no `compose.yaml` fallback. Run `PYTHONPATH=src python3 -m docker_orchestrator.scaffold <workspace-root>/.winter/config/winter-service-docker/` to generate starter files (see the extension's README for the canonical invocation).

Port substitution variables (`WSD_PORT_<NAME>`) are derived from winter's port registry and injected into Compose's environment, so each env gets its own host port assignments without you wiring them by hand.

For workspace-singleton services, add a separate `workspace-compose.yaml` under `.winter/config/winter-service-docker/` and declare the services there. See the extension's [`context/workspace-singletons.md`](https://github.com/paul-gross/winter-service-docker/blob/master/context/workspace-singletons.md) for the full contract.

:::note[Canonical source]
[`winter-service-docker`](https://github.com/paul-gross/winter-service-docker) — see its [`index.md`](https://github.com/paul-gross/winter-service-docker/blob/master/index.md) and the `context/` directory for per-env isolation, workspace singletons, and the provider wire contract.
:::
