"use client";
import { useEffect } from "react";
export default function Install() {
  useEffect(() => { if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* Installation is optional. */ });
  } }, []);
  return <details className="install"><summary>Keep Christian's Advent on your home screen</summary><p>On iPhone or iPad, open Safari’s Share menu and choose Add to Home Screen. On Android, use your browser’s Install app or Add to Home screen option. Calendar content currently needs a connection.</p></details>;
}
