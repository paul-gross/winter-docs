// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
	site: 'https://paul-gross.github.io',
	base: '/winter-docs',
	integrations: [
		starlight({
			title: 'Winter',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/paul-gross/winter' },
			],
			plugins: [
				starlightLlmsTxt({
					projectName: 'Winter',
					description:
						'Winter is a framework for agentic, multi-worktree, multi-repository development workspaces.',
				}),
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'What is Winter?', slug: 'getting-started' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
						{ label: 'Glossary', slug: 'getting-started/glossary' },
					],
				},
				{
					label: 'Operations',
					items: [
						{ label: 'Overview', slug: 'operations' },
						{ label: 'Feature Environments & Worktrees', slug: 'operations/feature-environments' },
						{ label: 'Polyrepo Git Operations', slug: 'operations/polyrepo-git' },
						{ label: 'Running Services', slug: 'operations/services' },
					],
				},
				{
					label: 'CLI Reference',
					items: [
						{ label: 'Commands', slug: 'cli-reference' },
						{ label: 'config.toml Reference', slug: 'cli-reference/config' },
					],
				},
				{
					label: 'Extensions',
					items: [{ label: 'Overview', slug: 'extensions' }],
				},
				{
					label: 'Conventions',
					items: [{ label: 'Overview', slug: 'conventions' }],
				},
			],
		}),
	],
});
