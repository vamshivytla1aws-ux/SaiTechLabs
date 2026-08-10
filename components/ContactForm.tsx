"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import type { ApiResponse } from "@/types/forms";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity() || status === "submitting") { event.currentTarget.reportValidity(); return; }
    setStatus("submitting"); setFeedback("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as ApiResponse;
      if (!response.ok || !result.success) { setStatus("error"); setFeedback(result.message || "Something went wrong. Please try again."); return; }
      formRef.current?.reset(); setStatus("success");
    } catch { setStatus("error"); setFeedback("We could not send your enquiry. Please check your connection and try again."); }
  };
  if (status === "success") return <div className="form-success compact" role="status"><CheckCircle2 /><h2>Thank you for contacting SaiTech Labs.</h2><p>Our team will get back to you shortly.</p><button type="button" className="text-button" onClick={() => setStatus("idle")}>Send another enquiry</button></div>;
  return <form ref={formRef} className="premium-form contact-form" onSubmit={submit}><div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><label>Name *<input name="name" minLength={2} maxLength={100} autoComplete="name" required placeholder="Your name" /></label><label>Phone *<input name="phone" type="tel" autoComplete="tel" pattern="[0-9+ ()-]{10,20}" required placeholder="+91 00000 00000" /></label><label>Email *<input name="email" maxLength={254} type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Message *<textarea name="message" minLength={5} maxLength={1500} rows={5} required placeholder="How can we help?" /></label>{status === "error" && <p className="form-error" role="alert"><AlertCircle />{feedback}</p>}<p className="form-note">Your information is used only to respond to your enquiry.</p><button type="submit" disabled={status === "submitting"} className="button button-primary submit-button">{status === "submitting" ? "Submitting..." : "Send enquiry"}{status !== "submitting" && <Send />}</button></form>;
}
