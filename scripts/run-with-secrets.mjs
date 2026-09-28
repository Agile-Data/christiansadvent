import { execFileSync, spawn } from "node:child_process";
// No .env files or on-disk secret copies. The process receives only this app's keys.
const allowed = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET", "AUTH0_AUDIENCE", "APP_URL", "API_URL"];
try {
  const raw = execFileSync("aws", ["secretsmanager", "get-secret-value", "--secret-id", process.env.APP_SECRET_ID || "christiansadvent-local", "--profile", process.env.AWS_PROFILE || "agile-dev", "--region", process.env.AWS_REGION || "us-east-1", "--query", "SecretString", "--output", "text"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const values = JSON.parse(raw), env = { ...process.env };
  for (const key of allowed) {
    if (typeof values[key] !== "string" || !values[key]) throw new Error("Missing setting: " + key);
    env[key] = values[key];
  }
  const command = process.argv[2] || "dev";
  if (!["dev", "start"].includes(command)) throw new Error("Use dev or start");
  const args = command === "start" ? ["scripts/start.mjs"] : ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3004"];
  const child = spawn(process.execPath, args, { env, stdio: "inherit" });
  child.on("exit", code => process.exit(code ?? 1));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
} catch {
  console.error("Unable to load Christian’s Advent settings from AWS Secrets Manager. Check SSO, secret name, and required keys in README.md. No secret values were written to disk.");
  process.exitCode = 1;
}
