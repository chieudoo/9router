import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const changelog = await readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  return new Response(changelog, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
