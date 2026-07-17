import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("the public interface is English and explains the privacy model", async () => {
  const [home, conversation, layout] = await Promise.all([
    source("app/page.tsx"),
    source("app/c/[id]/page.tsx"),
    source("app/layout.tsx"),
  ]);

  assert.match(layout, /<html lang="en">/);
  assert.match(home, /Your conversation is cargo/);
  assert.match(home, /no human review, no profiling, no ads, and no model training/i);
  assert.match(home, /Claude imports use Jina Reader/);
  assert.match(conversation, /Anyone with this URL can read it/);
});

test("deletion authority is separate from the public URL", async () => {
  const [importRoute, deleteRoute, client] = await Promise.all([
    source("app/api/import/route.ts"),
    source("app/api/conversations/[id]/route.ts"),
    source("components/delete-conversation-button.tsx"),
  ]);

  assert.match(importRoute, /randomBytes\(32\)/);
  assert.match(importRoute, /sha256/);
  assert.doesNotMatch(importRoute, /shareUrl:.*deleteToken/);
  assert.match(deleteRoute, /x-chatbridge-delete-token/);
  assert.match(client, /localStorage/);
});

test("shared conversations and markdown exports cannot be indexed", async () => {
  const [config, conversation, markdownRoute] = await Promise.all([
    source("next.config.ts"),
    source("app/c/[id]/page.tsx"),
    source("app/api/conversations/[id]/markdown/route.ts"),
  ]);

  const robotsPolicy = /noindex, nofollow, noarchive, nosnippet, noimageindex/;

  assert.match(conversation, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/);
  assert.match(config, /source:\s*"\/c\/:path\*"/);
  assert.match(config, robotsPolicy);
  assert.match(markdownRoute, /"x-robots-tag"/);
  assert.match(markdownRoute, robotsPolicy);
});
