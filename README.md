# ChatBridge

Carry the context. Switch the model.

ChatBridge turns a public ChatGPT, Claude, or Gemini conversation into one clean URL that another AI can read. Generated pages are public to anyone who has the URL, are excluded from search indexing, and expire after 30 days.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fensaktas1%2Fchatbridge&env=DATABASE_URL,CRON_SECRET&envDescription=Neon%20Postgres%20connection%20string%20and%20a%20long%20random%20cron%20secret)

## Features

- Imports public share links from ChatGPT, Claude, and Gemini
- Creates a clean, provider-neutral conversation page
- Exports every bridge as Markdown
- Uses a browser-only deletion key so public viewers cannot delete a bridge
- Deletes expired rows daily with Vercel Cron
- Requires no user account or sign-in
- Uses BE UI-inspired motion, components, and visual tokens

## Local development

Requirements: Node.js 22+, npm, and a Postgres database. Neon is the recommended serverless Postgres provider for Vercel.

```bash
git clone https://github.com/ensaktas1/chatbridge.git
cd chatbridge
npm install
cp .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
CRON_SECRET=replace-with-a-long-random-value
```

The application creates its `conversations` table and expiry index on first use.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import `ensaktas1/chatbridge` in Vercel.
3. In the Vercel Marketplace, add a Neon Postgres integration to the project. Vercel will inject `DATABASE_URL`.
4. Add a long random `CRON_SECRET` in Project Settings → Environment Variables.
5. Deploy. The `vercel.json` schedule calls `/api/cron/cleanup` once per day.

The project uses standard Next.js scripts, so Vercel needs no custom build command.

## Privacy model

ChatBridge must fetch, parse, and store the public conversation to create the requested page. It does not include accounts, profiling, advertising, content analytics, or model training. Conversation rows are stored in your configured Postgres database and can be deleted immediately from the browser that created them. A daily job removes rows after 30 days.

Important limitations:

- Anyone with a generated ChatBridge URL can read that conversation.
- The deletion token is stored only in the creator's browser and is never included in the public URL.
- Claude imports use [Jina Reader](https://jina.ai/reader/) as a transport proxy because Claude blocks direct server-to-server snapshot requests.
- Your deployment host, database provider, original AI provider, and any transport proxy process data under their own terms.
- Do not import secrets or material you do not have permission to share.

## Architecture

- Next.js App Router and React
- [Motion](https://motion.dev/) for BE UI-style spring interactions
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver) for Postgres over HTTP
- Vercel Cron for expiry cleanup

The UI takes its visual language and component behavior from [BE UI](https://beui.dev/), whose open-source project is MIT licensed. ChatBridge keeps the adapted components in this repository so they are easy to inspect and change.

## Commands

```bash
npm run dev     # local development
npm run build   # production build
npm run lint    # ESLint
npm test        # source-level behavior checks
```

## Contributing

Issues and pull requests are welcome. Please run `npm run lint`, `npm test`, and `npm run build` before opening a pull request.

## License

[MIT](LICENSE)
