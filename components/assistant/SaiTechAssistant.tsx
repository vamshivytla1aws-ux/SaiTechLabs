"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChevronDown, ExternalLink, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string; links?: { label: string; href: string }[] };
const hiddenPrefixes = ["/admin", "/student", "/interview", "/certificate", "/feedback"];
const allowedPages = new Set(["/", "/about", "/program", "/courses", "/trainers", "/admissions", "/contact", "/privacy", "/terms"]);
const initial: ChatMessage = { role: "assistant", content: "Hi! I’m SaiTech AI. Ask me about our courses, 60-day program, trainers, admissions, or how to contact us." };

function initialMessages(): ChatMessage[] {
  try {
    const stored = sessionStorage.getItem("saitech-ai-messages");
    return stored ? JSON.parse(stored) as ChatMessage[] : [initial];
  } catch { return [initial]; }
}

function sessionId() {
  const existing = sessionStorage.getItem("saitech-ai-session");
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem("saitech-ai-session", created);
  return created;
}

export function SaiTechAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages, busy]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix)) || !allowedPages.has(pathname)) return null;

  async function send(text = draft) {
    const message = text.trim();
    if (!message || busy) return;
    const user: ChatMessage = { role: "user", content: message };
    const next = [...messages, user].slice(-12);
    setMessages(next); setDraft(""); setBusy(true);
    try {
      const response = await fetch("/api/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, sessionId: sessionId(), page: pathname, history: messages.slice(-6).map(({ role, content }) => ({ role, content })) }) });
      const data = await response.json() as { success: boolean; answer?: string; suggestedLinks?: { label: string; href: string }[]; message?: string };
      const assistant: ChatMessage = { role: "assistant", content: data.success && data.answer ? data.answer : data.message || "I’m temporarily unavailable. Please try again shortly.", links: data.success ? data.suggestedLinks : undefined };
      const updated = [...next, assistant].slice(-12); setMessages(updated); sessionStorage.setItem("saitech-ai-messages", JSON.stringify(updated));
    } catch {
      setMessages([...next, { role: "assistant", content: "I’m temporarily unavailable. You can call or WhatsApp SaiTech Labs on +91 94939 69696." }]);
    } finally { setBusy(false); }
  }

  return <div className={`ai-assistant ${open ? "open" : ""}`}>
    {open && <section className="ai-panel" role="dialog" aria-modal="false" aria-label="SaiTech AI assistant">
      <header><span><Bot aria-hidden="true" /></span><div><strong>SaiTech AI</strong><small><i /> Website assistant</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Minimize assistant"><ChevronDown /></button><button type="button" onClick={() => { setOpen(false); setMessages([initial]); sessionStorage.removeItem("saitech-ai-messages"); }} aria-label="Close and clear chat"><X /></button></header>
      <div className="ai-log" ref={logRef} role="log" aria-live="polite">
        {messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}><p>{message.content}</p>{message.links?.length ? <nav aria-label="Suggested pages">{message.links.map((link) => <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}<ExternalLink /></Link>)}</nav> : null}</div>)}
        {busy && <div className="ai-message assistant ai-typing" aria-label="SaiTech AI is typing"><span /><span /><span /></div>}
      </div>
      {messages.length === 1 && <div className="ai-chips">{["Explore courses", "Who are the trainers?", "How do I enroll?"].map((label) => <button type="button" key={label} onClick={() => void send(label)}>{label}</button>)}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void send(); }}><textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} maxLength={800} rows={1} placeholder="Ask about SaiTech Labs…" aria-label="Message SaiTech AI" /><button type="submit" disabled={busy || !draft.trim()} aria-label="Send message"><Send /></button></form>
      <footer><Sparkles /> Answers use SaiTech Labs website information.</footer>
    </section>}
    <button className="ai-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close SaiTech AI" : "Open SaiTech AI"}><span>{open ? <X /> : <MessageCircle />}</span><strong>SaiTech AI</strong></button>
  </div>;
}
