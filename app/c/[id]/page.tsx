import { notFound } from "next/navigation";
import { getConversation } from "../../../lib/conversations";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) notFound();
  return <main className="conversation-page">
    <a className="brand" href="/"><span className="brand-mark">CB</span><span>ChatBridge</span></a>
    <header className="conversation-head">
      <div className="eyebrow"><span>Paylaşılan konuşma</span></div>
      <h1>{conversation.title}</h1>
      <div className="conversation-meta"><span>{conversation.source}</span><span>·</span><span>{conversation.messages.length} mesaj</span><span>·</span><span>{new Date(conversation.createdAt).toLocaleDateString("tr-TR")}</span></div>
      <div className="conversation-actions"><a href={`/api/conversations/${id}/markdown`}>Markdown indir</a><a href={conversation.sourceUrl} rel="nofollow noreferrer" target="_blank">Orijinali aç ↗</a></div>
    </header>
    <section aria-label="Konuşma mesajları">
      {conversation.messages.map((message, index) => <article className="message" key={index}>
        <div className={`message-role ${message.role}`}>{message.role === "user" ? "Kullanıcı" : "Asistan"}</div>
        <div className="message-content">{message.content}</div>
      </article>)}
    </section>
  </main>;
}
