// scripts/scrape.mjs
import fs from "node:fs/promises";
import fetch from "node-fetch";
import { load } from "cheerio";          // <- fixed import ✔

const pages = [
  "https://www.darkalphacapital.com/",
  "https://www.darkalphacapital.com/strategy",
  "https://www.darkalphacapital.com/team",
];

const chunks = [];

for (const url of pages) {
  const html = await (await fetch(url)).text();
  const $ = load(html);                 // <- use the named export
  $("script,noscript,style").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  for (let i = 0; i < text.length; i += 1024) {
    chunks.push({ url, content: text.slice(i, i + 1024) });
  }
}

await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/siteContent.json", JSON.stringify(chunks, null, 2));
console.log(`✅  saved ${chunks.length} chunks to data/siteContent.json`);
