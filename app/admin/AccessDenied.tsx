import { LogoutButton } from "./LogoutButton";
import Link from "next/link";

export function AccessDenied({ email }: { email: string }) {
  return <main className="admin-auth-shell"><section className="admin-auth-card"><img src="/assets/pashugrih-logo.png" alt="Pashuगृह" /><p className="auth-kicker">Pashuगृह Admin</p><h1>Admin role required</h1><p><strong>{email}</strong> is signed in, but this account has not been assigned the <code>admin</code> role in Netlify Identity.</p><p>Ask the site owner to assign the role, then sign in again.</p><LogoutButton /><Link className="auth-secondary-link" href="/">Return to website</Link></section></main>;
}
