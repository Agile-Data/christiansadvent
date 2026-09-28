import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { id: "/", name: "Christian's Advent", short_name: "Christian's Advent", description: "A little wonder, every day.",
    start_url: "/calendar", display: "standalone", background_color: "#ffffff", theme_color: "#173f35",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] };
}
