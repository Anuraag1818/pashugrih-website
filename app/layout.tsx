import type { Metadata } from "next";
import "./globals.css";
import { AuthCallback } from "./AuthCallback";

export const metadata: Metadata = {
  title: "Pashuगृह | भरोसेमंद पशु, भागलपुर",
  description:
    "भागलपुर, बिहार में स्वस्थ Sahiwal, Gir, Holstein Friesian और Jersey पशुओं की जानकारी और सीधे WhatsApp संपर्क।",
  icons: {
    icon: "/assets/pashugrih-logo.png",
    shortcut: "/assets/pashugrih-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body><AuthCallback>{children}</AuthCallback></body>
    </html>
  );
}
