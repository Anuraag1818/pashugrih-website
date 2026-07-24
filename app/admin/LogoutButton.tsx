"use client";

import { logout } from "@netlify/identity";
import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  return <button className="admin-signout" type="button" disabled={busy} onClick={async () => {
    setBusy(true);
    try {
      await logout();
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }}>{busy ? "Signing out…" : "Sign out"}</button>;
}
