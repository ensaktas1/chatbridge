import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteConversationButton } from "../../../components/delete-conversation-button";
import { getConversation } from "../../../lib/conversations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  return (
    <main className="conversation-page">
      <nav className="conversation-nav">
        <Link className="brand" href="/" aria-label="ChatBridge home">
          <span className="brand-mark"><BridgeIcon /></span><span>ChatBridge</span>
        </Link>
        <DeleteConversationButton id={id} />
      </nav>

      <header className="conversation-head">
        <div className="conversation-label"><span className="pulse-dot" /> Shared conversation</div>
        <h1>{conversation.title}</h1>
        <div className="conversation-meta">
          <span>{conversation.source}</span><i />
          <span>{conversation.messages.length} messages</span><i />
          <span>{new Date(conversation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="conversation-actions">
          <a className="primary-action" href={`/api/conversations/${id}/markdown`}><DownloadIcon /> Download Markdown</a>
          <a className="secondary-action" href={conversation.sourceUrl} rel="nofollow noreferrer" target="_blank">Open original <span>↗</span></a>
        </div>
      </header>

      <section className="messages" aria-label="Conversation messages">
        {conversation.messages.map((message, index) => (
          <article className={`message ${message.role}`} key={index}>
            <div className="message-rail"><span>{String(index + 1).padStart(2, "0")}</span><b>{message.role === "user" ? "You" : "Assistant"}</b></div>
            <div className="message-content">{message.content}</div>
          </article>
        ))}
      </section>

      <footer className="conversation-footer">
        <span>Bridge expires {new Date(conversation.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        <span>Anyone with this URL can read it.</span>
      </footer>
    </main>
  );
}

function BridgeIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 17V9m14 8V9M5 12c3.5 0 3.5-5 7-5s3.5 5 7 5M5 17h14" /></svg>; }
function DownloadIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14" /></svg>; }
