import { neon } from "@neondatabase/serverless";

export type Message = { role: "user" | "assistant"; content: string };

export type Conversation = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  messages: Message[];
  createdAt: number;
  expiresAt: number;
};

type StoredConversation = Conversation & { deleteTokenHash: string };

type ConversationRow = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  messages: Message[] | string;
  created_at: string | number;
  expires_at: string | number;
};

let readyPromise: Promise<void> | undefined;

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Database unavailable. Add DATABASE_URL to your environment.");
  }

  return neon(connectionString);
}

async function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const sql = database();
      await sql`CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        source_url TEXT NOT NULL,
        messages JSONB NOT NULL,
        created_at BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        delete_token_hash TEXT NOT NULL
      )`;
      await sql`CREATE INDEX IF NOT EXISTS conversations_expires_at_idx
        ON conversations (expires_at)`;
    })().catch((error) => {
      readyPromise = undefined;
      throw error;
    });
  }

  await readyPromise;
}

export async function saveConversation(conversation: StoredConversation) {
  await ready();
  const sql = database();
  const messages = JSON.stringify(conversation.messages);

  await sql`INSERT INTO conversations
    (id, title, source, source_url, messages, created_at, expires_at, delete_token_hash)
    VALUES (
      ${conversation.id}, ${conversation.title}, ${conversation.source},
      ${conversation.sourceUrl}, ${messages}::jsonb, ${conversation.createdAt},
      ${conversation.expiresAt}, ${conversation.deleteTokenHash}
    )`;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  await ready();
  const sql = database();
  const rows = await sql.query(
    "SELECT id, title, source, source_url, messages, created_at, expires_at FROM conversations WHERE id = $1 AND expires_at > $2 LIMIT 1",
    [id, Date.now()],
  ) as ConversationRow[];
  const row = rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    title: String(row.title),
    source: String(row.source),
    sourceUrl: String(row.source_url),
    messages: typeof row.messages === "string" ? JSON.parse(row.messages) : row.messages,
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
  };
}

export async function deleteConversation(id: string, deleteTokenHash: string) {
  await ready();
  const sql = database();
  const rows = await sql.query(
    "DELETE FROM conversations WHERE id = $1 AND delete_token_hash = $2 RETURNING id",
    [id, deleteTokenHash],
  ) as Array<{ id: string }>;
  return rows.length === 1;
}

export async function purgeExpiredConversations() {
  await ready();
  const sql = database();
  const rows = await sql.query(
    "DELETE FROM conversations WHERE expires_at <= $1 RETURNING id",
    [Date.now()],
  ) as Array<{ id: string }>;
  return rows.length;
}

export function toMarkdown(conversation: Conversation) {
  const messages = conversation.messages
    .map((message) => `## ${message.role === "user" ? "User" : "Assistant"}\n\n${message.content}`)
    .join("\n\n---\n\n");
  return `# ${conversation.title}\n\nSource: ${conversation.source}\n\n${messages}\n`;
}
