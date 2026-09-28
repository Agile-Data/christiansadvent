import type { Metadata, Viewport } from "next";
import NavigationMenu from "@/components/NavigationMenu";
import ProfileMenu from "@/components/ProfileMenu";
import Install from "@/components/Install";
import "./globals.css";
export const metadata: Metadata = {
  title: "Christian's Advent · A little wonder, every day",
  description: "A December calendar for your people. Make room for stories, kindness, and traditions worth keeping.",
  icons: { icon: [{ url: "/icon.svg?v=2", type: "image/svg+xml" }, { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" }], apple: "/apple-icon.png?v=2" },
  appleWebApp: { capable: true, title: "Christian's Advent", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#173f35" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><header className="masthead"><div className="masthead-brand"><NavigationMenu /><a className="wordmark" href="/" aria-label="Christian's Advent home"><img src="/brand/door-star.svg" width="40" height="40" alt="" /><span className="wordmark-text">Christian's Advent</span><span className="wordmark-short" aria-hidden="true">Advent</span></a></div>
    <div className="masthead-account"><ProfileMenu /></div>
  </header>{children}<footer>A little wonder. A little kindness. Your kind of Christmas.<Install /></footer></body></html>;
}
