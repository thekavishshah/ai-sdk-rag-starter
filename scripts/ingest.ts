import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { google } from "@ai-sdk/google";
import pg from "pg";

/* -------------------------------------------------------
   ①  Embedding model
      - API key is read from env var GOOGLE_GENERATIVE_AI_API_KEY
      - No options object needed
-------------------------------------------------------- */
const embedModel = google.textEmbeddingModel("text-embedding-004");

/* -------------------------------------------------------
   ②  Main loader
-------------------------------------------------------- */
async function main() {
  const baseDir = "data/dark-alpha";
  const files = await fs.readdir(baseDir);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  for (const file of files) {
    const raw = await fs.readFile(path.join(baseDir, file), "utf8");

    // split ~1 500 chars
    for (let i = 0; i < raw.length; i += 1500) {
      const chunk = raw.slice(i, i + 1500);
      const hash  = crypto.createHash("sha256").update(chunk).digest("hex");

      const dup = await client.query(
        "SELECT 1 FROM embeddings WHERE hash = $1 LIMIT 1",
        [hash],
      );
      if (dup.rowCount) continue;

      /* --- embed with the new API --- */
      const { embeddings } = await embedModel.doEmbed({ values: [chunk] });

      const vec = embeddings[0];                   // Float32Array → number[]
      const vecTxt = "[" + Array.from(vec).join(",") + "]";

      await client.query(
      "INSERT INTO embeddings (content, embedding, hash) VALUES ($1,$2,$3)",
      [chunk, vecTxt, hash],                     // <- send as text literal
      );
      console.log("Inserted", hash.slice(0, 6));
    }
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
