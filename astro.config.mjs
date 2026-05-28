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
					items: [{ label: 'Overview', slug: 'getting-started' }],
				},
				{
					label: 'Operations',
					items: [{ label: 'Overview', slug: 'operations' }],
				},
				{
					label: 'CLI Reference',
					items: [{ label: 'Overview', slug: 'cli-reference' }],
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
