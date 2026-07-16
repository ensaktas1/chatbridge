import type { Message } from "./conversations";

const providers = [
  { hosts: ["chatgpt.com", "chat.openai.com"], name: "ChatGPT" },
  { hosts: ["claude.ai"], name: "Claude" },
  { hosts: ["gemini.google.com", "g.co"], name: "Gemini" },
];

type ClaudeContentBlock = { type?: string; text?: string };
type ClaudeMessage = {
  sender?: string;
  text?: string;
  content?: ClaudeContentBlock[];
};
type ClaudeSnapshot = {
  snapshot_name?: string;
  chat_messages?: ClaudeMessage[];
};

function decodeHtml(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\\n/g, "\n").replace(/\\\"/g, '"').trim();
}

function textFromHtml(html: string) {
  return decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/article>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n"));
}

function extractJsonMessages(html: string): Message[] {
  const found: Message[] = [];
  const patterns = [
    /"role"\s*:\s*"(user|assistant)"[\s\S]{0,500}?"(?:text|content)"\s*:\s*"((?:\\.|[^"\\]){2,})"/g,
    /"sender"\s*:\s*"(human|assistant)"[\s\S]{0,500}?"text"\s*:\s*"((?:\\.|[^"\\]){2,})"/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const role = match[1] === "user" || match[1] === "human" ? "user" : "assistant";
      const content = decodeHtml(match[2]).replace(/\\u003c/g, "<").replace(/\\u003e/g, ">");
      if (content.length > 1 && !found.some((item) => item.role === role && item.content === content)) found.push({ role, content });
    }
    if (found.length >= 2) break;
  }
  return found.slice(0, 200);
}

function parseClaudeSnapshot(payload: string) {
  const jsonStart = payload.indexOf("{");
  const jsonEnd = payload.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error("Claude returned an invalid conversation payload.");

  let snapshot: ClaudeSnapshot;
  try {
    snapshot = JSON.parse(payload.slice(jsonStart, jsonEnd + 1)) as ClaudeSnapshot;
  } catch {
    throw new Error("Claude's conversation payload could not be parsed.");
  }

  const messages: Message[] = [];
  for (const message of snapshot.chat_messages ?? []) {
    if (message.sender !== "human" && message.sender !== "assistant") continue;
    const blocks = (message.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text?.trim() ?? "")
      .filter(Boolean);
    const content = (blocks.length ? blocks.join("\n\n") : message.text?.trim()) ?? "";
    if (!content) continue;
    messages.push({ role: message.sender === "human" ? "user" : "assistant", content });
  }

  if (!messages.length) throw new Error("No readable messages were found in this Claude conversation.");
  return { title: snapshot.snapshot_name?.trim().slice(0, 140) || "Claude conversation", messages };
}

async function importClaudeShare(url: URL) {
  const snapshotId = url.pathname.match(/^\/share\/([0-9a-f-]{36})\/?$/i)?.[1];
  if (!snapshotId) throw new Error("Enter a valid Claude share URL.");

  // Claude renders public snapshots through a JSON endpoint protected from
  // server-to-server requests. Jina Reader provides a text proxy for that
  // public endpoint, which keeps this adapter deployable on serverless hosts.
  const endpoint = `https://r.jina.ai/http://claude.ai/api/chat_snapshots/${snapshotId}?rendering_mode=messages%26render_all_tools=true`;
  const response = await fetch(endpoint, {
    headers: { accept: "text/plain", "user-agent": "ChatBridge/0.2 (+https://chatbridge.app)" },
  });
  if (!response.ok) throw new Error("Claude's shared conversation could not be reached. Make sure the link is public.");
  const payload = await response.text();
  if (payload.length > 5_000_000) throw new Error("This conversation is too large to import.");
  const parsed = parseClaudeSnapshot(payload);
  return { ...parsed, source: "Claude", sourceUrl: url.toString() };
}

export async function importFromShareUrl(input: string) {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error("Enter a valid public share URL."); }
  if (url.protocol !== "https:") throw new Error("The share URL must use HTTPS.");
  const provider = providers.find((item) => item.hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
  if (!provider) throw new Error("ChatBridge currently supports ChatGPT, Claude, and Gemini share URLs.");

  if (provider.name === "Claude") return importClaudeShare(url);

  const response = await fetch(url.toString(), { headers: { "user-agent": "ChatBridge/0.1 (+https://chatbridge.app)", accept: "text/html" }, redirect: "follow" });
  if (!response.ok) throw new Error("The shared conversation could not be reached. Make sure the link is public.");
  const finalUrl = new URL(response.url);
  if (!provider.hosts.some((host) => finalUrl.hostname === host || finalUrl.hostname.endsWith(`.${host}`))) throw new Error("The share URL redirected to an unexpected domain.");
  const html = await response.text();
  if (html.length > 5_000_000) throw new Error("This conversation is too large to import.");

  let messages = extractJsonMessages(html);
  const visible = textFromHtml(html);
  if (messages.length < 2 && visible.length > 80) messages = [{ role: "assistant", content: visible.slice(0, 120_000) }];
  if (!messages.length) throw new Error("The conversation could not be read. The provider may be protecting this share page.");
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1]).replace(/\s*[|–-]\s*(Claude|ChatGPT|Gemini).*$/i, "").slice(0, 140) : `${provider.name} conversation`;
  return { title: title || `${provider.name} conversation`, source: provider.name, sourceUrl: url.toString(), messages };
}
