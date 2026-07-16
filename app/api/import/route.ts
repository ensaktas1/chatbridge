import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { importFromShareUrl } from "../../../lib/adapters";
import { saveConversation } from "../../../lib/conversations";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { url?: string };
    if (!body.url || body.url.length > 2048) {
      return NextResponse.json({ error: "Enter a valid public share URL." }, { status: 400 });
    }

    const imported = await importFromShareUrl(body.url);
    const id = randomBytes(10).toString("hex");
    const deleteToken = randomBytes(32).toString("base64url");
    const deleteTokenHash = createHash("sha256").update(deleteToken).digest("hex");
    const createdAt = Date.now();

    await saveConversation({
      id,
      ...imported,
      createdAt,
      expiresAt: createdAt + THIRTY_DAYS,
      deleteTokenHash,
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      id,
      title: imported.title,
      source: imported.source,
      messageCount: imported.messages.length,
      shareUrl: `${origin}/c/${id}`,
      deleteToken,
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "The conversation could not be imported.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
