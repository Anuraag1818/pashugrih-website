"use client";

import { login, logout, requestPasswordRecovery } from "@netlify/identity";
import { useState } from "react";

export function AdminLoginForm({ signedInEmail }: { signedInEmail?: string }) {
  const [email, setEmail] = useState(signedInEmail ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(signedInEmail ? "This account does not have the Admin role. Sign out and use the invited Admin account." : "");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (signedInEmail) await logout();
      await login(email.trim(), password);
      window.location.href = "/admin";
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not sign in.");
      setBusy(false);
    }
  }

  async function recover() {
    if (!email.trim()) return setMessage("Enter your Admin email first.");
    setBusy(true);
    try {
      await requestPasswordRecovery(email.trim());
      setMessage("A password recovery link has been sent to your email.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not send the recovery email.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-auth-shell"><section className="admin-auth-card"><img src="/assets/pashugrih-logo.png" alt="Pashuगृह" /><p className="auth-kicker">Pashuगृह Admin</p><h1>Sign in</h1><p>Use the email address invited through Netlify Identity.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="save-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>{message && <div className="admin-message" role="status">{message}</div>}<button className="auth-link-button" type="button" onClick={recover} disabled={busy}>Forgot password?</button><a className="auth-secondary-link" href="/">Return to website</a></section></main>;
}
