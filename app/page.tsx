"use client";

import { FormEvent, useState } from "react";

type ImportResult = {
  id: string;
  title: string;
  source: string;
  messageCount: number;
  shareUrl: string;
};

const providers = ["ChatGPT", "Claude", "Gemini"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function importConversation(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Konuşma içe aktarılamadı.");
      setResult(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="/" aria-label="ChatBridge ana sayfa">
          <span className="brand-mark">CB</span>
          <span>ChatBridge</span>
        </a>
        <div className="nav-right">
          <a href="#how">Nasıl çalışır?</a>
          <span className="status"><i /> Açık kaynak</span>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span>01</span> Evrensel AI sohbet bağlantısı</div>
        <h1>Sohbetin sende kalsın.<br /><em>Model değişse bile.</em></h1>
        <p className="lede">Claude, ChatGPT veya Gemini paylaşım bağlantısını tek, temiz ve her AI&apos;ın okuyabileceği bir sayfaya dönüştür.</p>

        <form className="import-card" onSubmit={importConversation}>
          <label htmlFor="share-url">Paylaşım bağlantısı</label>
          <div className="input-row">
            <span className="link-icon">↗</span>
            <input
              id="share-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://claude.ai/share/..."
              required
              autoComplete="url"
            />
            <button type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Okunuyor</> : <>Köprü oluştur <span>→</span></>}
            </button>
          </div>
          <div className="form-foot">
            <span>Desteklenenler</span>
            <div>{providers.map((provider) => <b key={provider}>{provider}</b>)}</div>
            <span className="privacy">İndekslenmez · 30 günde silinir · Claude: Jina Reader</span>
          </div>
          {error && <div className="notice error" role="alert">{error}</div>}
        </form>

        {result && (
          <section className="result" aria-live="polite">
            <div className="result-top">
              <span className="success-check">✓</span>
              <div><span>Köprü hazır</span><strong>{result.title}</strong></div>
              <small>{result.source} · {result.messageCount} mesaj</small>
            </div>
            <div className="share-row">
              <code>{result.shareUrl}</code>
              <button onClick={copyLink}>{copied ? "Kopyalandı" : "Linki kopyala"}</button>
              <a href={`/c/${result.id}`}>Aç ↗</a>
            </div>
          </section>
        )}
      </section>

      <section className="how" id="how">
        <div className="section-label">Nasıl çalışır?</div>
        <div className="steps">
          <article><span>01</span><div className="step-icon">⌁</div><h2>Paylaş</h2><p>AI sohbetini herkese açık bağlantı olarak paylaş.</p></article>
          <article><span>02</span><div className="step-icon">⇄</div><h2>Dönüştür</h2><p>ChatBridge mesajları ortak, temiz bir formata çevirsin.</p></article>
          <article><span>03</span><div className="step-icon">↗</div><h2>Devam et</h2><p>Yeni bağlantıyı başka bir AI&apos;a ver ve kaldığın yerden sürdür.</p></article>
        </div>
      </section>

      <footer><span>ChatBridge — bağlam, modelden bağımsızdır.</span><span>MIT License · Gizlilik</span></footer>
    </main>
  );
}
