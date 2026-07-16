"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BeuiButton } from "../components/beui-button";

type ImportResult = {
  id: string;
  title: string;
  source: string;
  messageCount: number;
  shareUrl: string;
  deleteToken: string;
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
      if (!response.ok) throw new Error(data.error || "The conversation could not be imported.");
      const imported = data as ImportResult;
      window.localStorage.setItem(`chatbridge:delete:${imported.id}`, imported.deleteToken);
      setResult(imported);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="landing">
      <nav className="site-nav">
        <Link className="brand" href="/" aria-label="ChatBridge home">
          <span className="brand-mark"><BridgeIcon /></span>
          <span>ChatBridge</span>
        </Link>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
          <a className="github-link" href="https://github.com/ensaktas1/chatbridge" target="_blank" rel="noreferrer">
            <GithubIcon /> Open source <span>↗</span>
          </a>
        </div>
      </nav>

      <section className="hero">
        <motion.a
          className="hero-pill"
          href="https://github.com/ensaktas1/chatbridge"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="pulse-dot" /> Open source · one link, any AI <span>↗</span>
        </motion.a>

        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          Carry the context.<br /><span>Switch the model.</span>
        </motion.h1>
        <motion.p className="lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          Turn a public ChatGPT, Claude, or Gemini conversation into one clean link that any AI can read.
        </motion.p>

        <motion.form
          className="import-panel"
          onSubmit={importConversation}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 160, damping: 22 }}
        >
          <label htmlFor="share-url">Public conversation URL</label>
          <div className="url-control">
            <LinkIcon />
            <input
              id="share-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://claude.ai/share/..."
              required
              autoComplete="url"
              aria-describedby="url-help"
            />
            <BeuiButton type="submit" size="lg" disabled={loading}>
              {loading ? <><span className="spinner light" /> Reading conversation</> : <>Create bridge <ArrowIcon /></>}
            </BeuiButton>
          </div>
          <div className="import-foot" id="url-help">
            <span>Works with</span>
            <div>{providers.map((provider) => <b key={provider}>{provider}</b>)}</div>
            <span className="retention"><ShieldIcon /> No accounts · 30-day retention · Claude via Jina Reader</span>
          </div>
          {error && <motion.div className="notice error" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}
        </motion.form>

        <AnimatePresence>
          {result && (
            <motion.section className="result" aria-live="polite" initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }}>
              <div className="result-status"><CheckIcon /><span>Bridge ready</span><small>{result.source} · {result.messageCount} messages</small></div>
              <h2>{result.title}</h2>
              <div className="share-row">
                <code>{result.shareUrl}</code>
                <BeuiButton onClick={copyLink}>{copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy link</>}</BeuiButton>
              <Link className="secondary-action" href={`/c/${result.id}`}>Open <span>↗</span></Link>
              </div>
              <p className="delete-note">The deletion key is saved only in this browser. Open the link here to delete it at any time.</p>
            </motion.section>
          )}
        </AnimatePresence>
      </section>

      <section className="section" id="how">
        <div className="section-kicker"><span>How it works</span><span>01 — 03</span></div>
        <h2 className="section-title">Model-independent context,<br />in three small steps.</h2>
        <div className="feature-grid">
          <article><span className="step-number">01</span><ShareIcon /><h3>Share</h3><p>Create a public share link inside ChatGPT, Claude, or Gemini.</p></article>
          <article><span className="step-number">02</span><BridgeIcon /><h3>Bridge</h3><p>We fetch the public page and preserve its messages in a clean, readable format.</p></article>
          <article><span className="step-number">03</span><ArrowIcon /><h3>Continue</h3><p>Paste the new ChatBridge link into another AI and continue with the full context.</p></article>
        </div>
      </section>

      <section className="section privacy-section" id="privacy">
        <div className="section-kicker"><span>Privacy by design</span><ShieldIcon /></div>
        <div className="privacy-heading">
          <h2 className="section-title">Your conversation is cargo.<br />Not our product.</h2>
          <p>ChatBridge must process the public share page to create your bridge. That processing is purpose-limited: no human review, no profiling, no ads, and no model training.</p>
        </div>
        <div className="privacy-grid">
          <article><LockIcon /><h3>No accounts</h3><p>No sign-up, identity profile, or personal conversation history.</p></article>
          <article><EyeOffIcon /><h3>No content analytics</h3><p>We do not inspect or analyze what you say. The server only converts and stores it for the public page you requested.</p></article>
          <article><TrashIcon /><h3>You control deletion</h3><p>Delete a bridge from the browser that created it, or let the daily cleanup remove it after 30 days.</p></article>
        </div>
        <p className="processor-note"><strong>Infrastructure note:</strong> Claude imports use Jina Reader as a transport proxy because Claude blocks direct server-to-server snapshot requests. Your hosting provider and database provider also process the data as infrastructure. Do not bridge material you are not allowed to share.</p>
        <div className="public-warning"><InfoIcon /><p><strong>Share intentionally.</strong> Anyone with a generated ChatBridge URL can read that conversation. Search engines are instructed not to index conversation pages.</p></div>
      </section>

      <footer>
        <Link className="brand" href="/"><span className="brand-mark"><BridgeIcon /></span><span>ChatBridge</span></Link>
        <p>Context should outlive the model.</p>
        <div><a href="https://github.com/ensaktas1/chatbridge" target="_blank" rel="noreferrer">GitHub ↗</a><span>MIT License</span></div>
      </footer>
    </main>
  );
}

function SvgIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">{children}</svg>;
}
function ArrowIcon() { return <SvgIcon><path d="M5 12h14m-5-5 5 5-5 5" /></SvgIcon>; }
function LinkIcon() { return <SvgIcon><path d="M9.5 14.5l5-5m-7.5 8H5.5a4 4 0 0 1 0-8H9m6-3h3.5a4 4 0 0 1 0 8H15" /></SvgIcon>; }
function CheckIcon() { return <SvgIcon><path d="m5 12 4 4L19 6" /></SvgIcon>; }
function CopyIcon() { return <SvgIcon><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1" /></SvgIcon>; }
function ShareIcon() { return <SvgIcon><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5" /></SvgIcon>; }
function BridgeIcon() { return <SvgIcon><path d="M5 17V9m14 8V9M5 12c3.5 0 3.5-5 7-5s3.5 5 7 5M5 17h14" /></SvgIcon>; }
function ShieldIcon() { return <SvgIcon><path d="M12 3 5 6v5c0 4.4 2.8 8.3 7 10 4.2-1.7 7-5.6 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></SvgIcon>; }
function LockIcon() { return <SvgIcon><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></SvgIcon>; }
function EyeOffIcon() { return <SvgIcon><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.8 5.2A10.8 10.8 0 0 1 12 5c5.3 0 9 7 9 7a15.7 15.7 0 0 1-2.1 3M6.2 6.2C4.1 7.8 3 12 3 12s3.7 7 9 7a9.7 9.7 0 0 0 3-.5" /></SvgIcon>; }
function TrashIcon() { return <SvgIcon><path d="M4 7h16M9 4h6m-9 3 1 13h10l1-13M10 11v5m4-5v5" /></SvgIcon>; }
function InfoIcon() { return <SvgIcon><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></SvgIcon>; }
function GithubIcon() { return <SvgIcon><path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.1-4.7-5.1 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.8 0 0 .8-.3 2.9 1.1A10 10 0 0 1 12 5.9a10 10 0 0 1 2.6.3c2-1.4 2.9-1.1 2.9-1.1.5 1.5.2 2.5.1 2.8.6.8 1 1.7 1 2.8 0 4-2.4 4.8-4.7 5.1.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z" /></SvgIcon>; }
