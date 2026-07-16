# ChatBridge

**Carry the context. Switch the model.**

ChatBridge converts public ChatGPT, Claude, and Gemini conversation URLs into clean, portable pages that other AI tools can read.

### [Try ChatBridge →](https://chatbridgeapp.vercel.app/)

## How it works

1. Paste a public ChatGPT, Claude, or Gemini conversation URL.
2. ChatBridge reads the shared conversation and creates a portable page.
3. Copy the new URL into another AI tool to continue with the same context.

## Features

- Supports public ChatGPT, Claude, and Gemini share URLs
- Preserves the conversation in a clean, provider-neutral format
- Produces a public URL that AI tools and browsers can read
- Exports conversations as Markdown
- Lets the creator delete a generated page from the same browser
- Automatically removes conversations after 30 days
- Keeps conversation pages out of search engine indexes

## Privacy

ChatBridge processes a public conversation only to create the requested page. It does not use conversation content for profiling, advertising, analytics, or model training.

- Generated pages are public to anyone with the URL.
- A deletion key is stored only in the browser that created the page.
- Conversations are deleted automatically after 30 days.
- Claude imports currently use [Jina Reader](https://jina.ai/reader/) as a transport proxy.
- Do not submit secrets or conversations you are not allowed to share.

## Run locally

You need Node.js 22+, npm, and a PostgreSQL database.

```bash
git clone https://github.com/ensaktas1/chatbridge.git
cd chatbridge
npm install
cp .env.example .env.local
npm run dev
```

Add the following values to `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
CRON_SECRET=replace-with-a-long-random-value
```

ChatBridge creates the required database table and expiry index automatically.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fensaktas1%2Fchatbridge&env=DATABASE_URL,CRON_SECRET&envDescription=Postgres%20connection%20string%20and%20a%20long%20random%20cron%20secret)

1. Import the repository into Vercel.
2. Connect a Neon Postgres database from the Vercel Marketplace.
3. Confirm that the integration added `DATABASE_URL` to the project.
4. Add a long random `CRON_SECRET` environment variable.
5. Deploy or redeploy the project.

The included `vercel.json` runs the expiry cleanup once per day.

## Stack

- Next.js App Router
- React
- [Motion](https://motion.dev/)
- [Neon serverless Postgres](https://neon.com/docs/serverless/serverless-driver)
- Vercel Cron

The interface is inspired by the open-source component and motion language of [BE UI](https://beui.dev/).

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## License

[MIT](LICENSE)
