# minotor.dev - Documentation and examples

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 24.15 or newer and npm 11.5.2 or newer. Install dependencies with `npm ci`, then run the development server.

Type checking uses TypeScript 7 through the `@typescript/native` alias. The
`typescript` alias supplies the TypeScript 6 API required by ESLint and Next.js
([TypeScript compatibility guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0)).

The bundled examples use the Swiss GTFS feed version `20261121`, exported for
November 23, 2026 with Minotor 13.0.1. To reproduce the export:

```bash
curl -fL https://data.opentransportdata.swiss/en/dataset/timetable-2026-gtfs2020/permalink -o /tmp/swiss-gtfs.zip
npx minotor parse-gtfs /tmp/swiss-gtfs.zip -d 2026-11-23 -p extended -t /tmp/timetable.bin -s /tmp/stops.bin
gzip -n -c /tmp/timetable.bin > public/2026-11-23_timetable.bin
gzip -n -c /tmp/stops.bin > public/2026-11-23_stops.bin
```

The feed permalink changes as new releases are published. Both `.bin` assets are
gzip-compressed and must be generated together with the installed Minotor version.

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
