import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { deleteConversation } from "../../../../lib/conversations";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleteToken = request.headers.get("x-chatbridge-delete-token");

  if (!deleteToken || deleteToken.length > 256) {
    return NextResponse.json({ error: "A valid deletion key is required." }, { status: 401 });
  }

  try {
    const deleteTokenHash = createHash("sha256").update(deleteToken).digest("hex");
    const deleted = await deleteConversation(id, deleteTokenHash);
    if (!deleted) {
      return NextResponse.json({ error: "This link cannot be deleted from this browser." }, { status: 403 });
    }
    return NextResponse.json({ deleted: true });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "The conversation could not be deleted.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
