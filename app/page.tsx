import { PashugrihSite } from "./components/PashugrihSite";
import { getSiteContent } from "../lib/content";

export const revalidate = false;

export default async function Home() {
  const content = await getSiteContent();
  return <PashugrihSite initialContent={content} />;
}
