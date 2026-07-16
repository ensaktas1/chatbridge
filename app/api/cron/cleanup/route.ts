import { NextResponse } from "next/server";
import { purgeExpiredConversations } from "../../../../lib/conversations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await purgeExpiredConversations();
  return NextResponse.json({ deleted });
}
