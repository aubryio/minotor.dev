# minotor.dev

Documentation website and interactive examples for [Minotor](https://github.com/aubryio/minotor), a public transit routing library. Built with Next.js and MDX, with a browser-based journey planner and isochrone map example

Visit [minotor.dev](https://minotor.dev).

## Development

Requires Node.js 24.15+ and npm 11.5.2+.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

- `doc/get-started.mdx` — library documentation.
- `app/page.tsx` — homepage and feature overview.
- `app/examples/` — interactive demos.

Run `npm run lint`, `npm run type:check`, and `npm test` to check changes. Use `npm run build` to create a production build.
