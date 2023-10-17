import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import UnoCSS from 'unocss/astro';
import vercel from '@astrojs/vercel/edge';
import netlify from '@astrojs/netlify/functions';
import node from '@astrojs/node';
import prefetch from '@astrojs/prefetch';
import disableBlocks from './plugins/disableBlocks';

const envAdapter = () => {
  switch (process.env.OUTPUT) {
    case 'vercel':
      return vercel();
    case 'netlify':
      return netlify({
        edgeMiddleware: true,
      });
    default:
      return node({ mode: 'standalone' });
  }
};

export default defineConfig({
  integrations: [
    UnoCSS({ injectReset: true }),
    solidJs(),
    prefetch({
      throttle: 3,
    }),
  ],
  output: 'server',
  adapter: envAdapter(),
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
  },
  vite: {
    plugins: [
      process.env.OUTPUT === 'vercel' && disableBlocks(),
      process.env.OUTPUT === 'netlify' && disableBlocks(),
    ],
  },
});
