"use client";

import { updateUser } from "@netlify/identity";
import { useState } from "react";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setMessage("Use at least 8 characters for the password.");
    if (password !== confirmPassword) return setMessage("The passwords do not match.");
    setBusy(true);
    try {
      await updateUser({ password });
      window.location.href = "/admin";
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not update the password.");
      setBusy(false);
    }
  }

  return <main className="admin-auth-shell"><section className="admin-auth-card"><img src="/assets/pashugrih-logo.png" alt="Pashuगृह" /><p className="auth-kicker">Pashuगृह Admin</p><h1>Set a new password</h1><form onSubmit={submit}><label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label><button className="save-button" disabled={busy}>{busy ? "Saving…" : "Save password"}</button></form>{message && <div className="admin-message" role="status">{message}</div>}</section></main>;
}
