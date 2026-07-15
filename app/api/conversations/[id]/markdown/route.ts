import { getConversation, toMarkdown } from "../../../../../lib/conversations";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) return new Response("Not found", { status: 404 });
  return new Response(toMarkdown(conversation), { headers: {
    "content-type": "text/markdown; charset=utf-8",
    "content-disposition": `attachment; filename="chatbridge-${id}.md"`,
  }});
}
