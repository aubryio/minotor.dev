import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import fs from 'fs';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const rehypePrettyCodeOptions = {
  theme: JSON.parse(fs.readFileSync('./app/code.json', 'utf-8')),
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    // Use the plugin by string name + plain-data options
    rehypePlugins: [['rehype-pretty-code', rehypePrettyCodeOptions]],
  },
});

export default withMDX(nextConfig);
