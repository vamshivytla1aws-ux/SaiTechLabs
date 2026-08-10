"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

export function StudentLoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await send("/api/student/login", "POST", { email: form.get("email"), password: form.get("password") });
      router.replace(result.mustChangePassword ? "/student/profile?password=required" : "/student/dashboard"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sign-in failed."); setBusy(false); }
  }
  return <form className="admin-login-form" onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label>{message && <p className="admin-alert error">{message}</p>}<button className="admin-primary" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></form>;
}

export function StudentPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await send("/api/student/password", "PATCH", { currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") });
      setMessage("Password changed. Sign in again.");
      setTimeout(() => { router.replace("/student/login"); router.refresh(); }, 800);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed."); setBusy(false); }
  }
  return <form className="admin-settings-form" onSubmit={submit}><label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required/></label><label>New password<input type="password" name="newPassword" minLength={12} autoComplete="new-password" required/><small>At least 12 characters with upper, lower, number, and symbol.</small></label><label>Confirm password<input type="password" name="confirmPassword" minLength={12} autoComplete="new-password" required/></label><button className="admin-primary" disabled={busy}>{busy ? "Updating..." : "Change password"}</button>{message && <p role="status">{message}</p>}</form>;
}
