"use client";

import { handleAuthCallback } from "@netlify/identity";
import { useEffect, useState } from "react";

const callbackPattern = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;

export function AuthCallback({ children }: { children: React.ReactNode }) {
  const [processing, setProcessing] = useState(() => typeof window !== "undefined" && callbackPattern.test(window.location.hash));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!callbackPattern.test(window.location.hash)) return;
    handleAuthCallback()
      .then((result) => {
        if (!result) return setProcessing(false);
        if (result.type === "invite" && result.token) {
          window.location.href = `/admin/accept-invite?token=${encodeURIComponent(result.token)}`;
        } else if (result.type === "recovery") {
          window.location.href = "/admin/reset-password";
        } else {
          window.location.href = "/admin";
        }
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Authentication link could not be processed.");
        setProcessing(false);
      });
  }, []);

  if (processing) return <main className="auth-loading">Securely confirming your Admin account…</main>;
  if (error) return <main className="auth-loading"><p>{error}</p><a href="/admin/login">Return to Admin login</a></main>;
  return <>{children}</>;
}
