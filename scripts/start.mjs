import { cpSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
// Next's standalone output omits these assets; bundle them before local startup.
cpSync("public", ".next/standalone/public", { recursive: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
process.env.PORT ||= "3004";
process.env.HOSTNAME ||= "127.0.0.1";
await import(pathToFileURL(resolve(".next/standalone/server.js")).href);
