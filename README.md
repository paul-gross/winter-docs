# Winter Docs

The documentation site for [Winter](https://github.com/paul-gross/winter) — a framework for agentic, multi-worktree,
multi-repository development workspaces.

Built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) and deployed to GitHub Pages at
<https://paul-gross.github.io/winter-docs/>.

## Local development

Requires Node 22+ (see `engines` in `package.json`).

```sh
npm install       # install dependencies
npm run dev       # serve at http://localhost:4321/winter-docs/
```

## Build

```sh
npm run build     # output the static site to dist/
npm run preview   # preview the production build locally
```

A production build also emits `llms.txt`, `llms-full.txt`, and `llms-small.txt` via the
[`starlight-llms-txt`](https://github.com/HiDeoo/starlight-llms-txt) plugin, so agents can consume the docs.

## Markdown style

Every `.md` file here — the README and every page under `src/content/docs/` — is held to the mechanical style gates
`dprint.json` and `.rumdl.toml` declare. Run both before pushing; one of them writes its own fix:

```sh
dprint check          # dprint fmt to apply
rumdl check .         # rumdl check . --fix for the autofixable subset
```

They also run through `winter lint`: the `winter-context` extension contributes the check, and committing these two
configs is what opts this repo into it. `.mdx` is deliberately outside the gate — the formatter does not own JSX.

## Deployment

Pushes to `master` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the site and
publishes it to GitHub Pages. The `site`/`base` in `astro.config.mjs` are set for project-page hosting under
`/winter-docs/`.
