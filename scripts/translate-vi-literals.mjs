import { readFile, writeFile } from "node:fs/promises";

const localePath = new URL("../public/i18n/literals/vi.json", import.meta.url);
const apiBase = process.env.NINEROUTER_URL || "http://localhost:20127";
const batchSize = 24;

const locale = JSON.parse(await readFile(localePath, "utf8"));
const keys = Object.keys(locale).filter((key) => locale[key] === key);
const { keys: apiKeys } = await fetch(`${apiBase}/api/keys`).then((response) => response.json());
const apiKey = apiKeys?.find((key) => key.isActive)?.key;
if (!apiKey) throw new Error("No active local API key found");

function placeholders(value) {
  return value.match(/\{\{[^}]+\}\}|\$\{[^}]+\}|%\d*\$?[sd]|<[^>]+>/g)?.sort() || [];
}

async function translate(batch) {
  const payload = Object.fromEntries(batch.map((key) => [key, key]));
  const response = await fetch(`${apiBase}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "cx/gpt-5.6-sol",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Translate the English user-interface strings to natural Vietnamese. Return only a JSON object with exactly the input keys. Preserve every key and placeholder exactly. Leave product names, model names, provider names, protocol and API names, URLs, paths, shell commands, code, environment variables, tokens, and technical abbreviations unchanged. Do not add explanations.",
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Translation failed: ${response.status} ${await response.text()}`);
  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Translation response was empty");
  const result = JSON.parse(content);
  if (Object.keys(result).length !== batch.length || batch.some((key) => typeof result[key] !== "string")) {
    throw new Error("Translation response did not preserve the batch schema");
  }
  for (const key of batch) {
    if (JSON.stringify(placeholders(result[key])) !== JSON.stringify(placeholders(key))) {
      throw new Error(`Translation changed placeholders for: ${key}`);
    }
  }
  return result;
}

for (let start = 0; start < keys.length; start += batchSize) {
  const batch = keys.slice(start, start + batchSize);
  let translated;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      translated = await translate(batch);
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`Batch ${start / batchSize + 1} failed (attempt ${attempt}): ${error.message}`);
    }
  }
  Object.assign(locale, translated);
  await writeFile(localePath, `${JSON.stringify(locale, null, 2)}\n`);
  console.log(`Translated ${Math.min(start + batchSize, keys.length)}/${keys.length}`);
}
