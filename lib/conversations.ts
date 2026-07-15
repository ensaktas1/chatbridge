import { env } from "cloudflare:workers";

export type Message = { role: "user" | "assistant"; content: string };
export type Conversation = {
  id: string; title: string; source: string; sourceUrl: string;
  messages: Message[]; createdAt: number; expiresAt: number;
};

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  messages TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
)`;

function db() {
  if (!env.DB) throw new Error("Veritabanı bağlantısı hazır değil.");
  return env.DB as D1Database;
}

async function ready() { await db().prepare(CREATE_TABLE).run(); }

export async function saveConversation(conversation: Conversation) {
  await ready();
  await db().prepare(`INSERT INTO conversations
    (id, title, source, source_url, messages, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(conversation.id, conversation.title, conversation.source, conversation.sourceUrl,
      JSON.stringify(conversation.messages), conversation.createdAt, conversation.expiresAt).run();
}

export async function getConversation(id: string): Promise<Conversation | null> {
  await ready();
  const row = await db().prepare("SELECT * FROM conversations WHERE id = ? AND expires_at > ?")
    .bind(id, Date.now()).first<Record<string, string | number>>();
  if (!row) return null;
  return {
    id: String(row.id), title: String(row.title), source: String(row.source), sourceUrl: String(row.source_url),
    messages: JSON.parse(String(row.messages)), createdAt: Number(row.created_at), expiresAt: Number(row.expires_at),
  };
}

export function toMarkdown(conversation: Conversation) {
  const messages = conversation.messages.map((message) =>
    `## ${message.role === "user" ? "User" : "Assistant"}\n\n${message.content}`).join("\n\n---\n\n");
  return `# ${conversation.title}\n\nSource: ${conversation.source}\n\n${messages}\n`;
}
