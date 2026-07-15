import { NextResponse } from "next/server";
import { importFromShareUrl } from "../../../lib/adapters";
import { saveConversation } from "../../../lib/conversations";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { url?: string };
    if (!body.url || body.url.length > 2048) return NextResponse.json({ error: "Geçerli bir paylaşım bağlantısı gir." }, { status: 400 });
    const imported = await importFromShareUrl(body.url);
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const createdAt = Date.now();
    await saveConversation({ id, ...imported, createdAt, expiresAt: createdAt + 30 * 24 * 60 * 60 * 1000 });
    const origin = new URL(request.url).origin;
    return NextResponse.json({ id, title: imported.title, source: imported.source, messageCount: imported.messages.length, shareUrl: `${origin}/c/${id}` });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Konuşma içe aktarılamadı.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
