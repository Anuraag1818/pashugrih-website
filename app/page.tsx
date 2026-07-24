import { PashugrihSite } from "./components/PashugrihSite";
import { getSiteContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return <PashugrihSite initialContent={content} />;
}
