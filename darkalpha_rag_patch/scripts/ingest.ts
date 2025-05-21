/** scripts/ingest.ts – embed Dark Alpha Capital docs into Postgres */
import fs from "fs/promises";
import path from "path";
import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { db } from "@/lib/db";
import { embeddings } from "@/lib/db/schema/embeddings";
import { toPgvectorLiteral } from "@/lib/utils/pgvector";
import { sql } from "drizzle-orm";

async function main() {
  const docsDir = path.join(process.cwd(), "data", "dark-alpha");
  const files = await fs.readdir(docsDir);

  const chunks: { content: string }[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(docsDir, file), "utf8");
    /* very naive chunking: ~1 500 chars ≈ 400 tokens */
    const parts = raw.match(/([\s\S]{1,1500})/g) ?? [];
    parts.forEach((p) => {
      const content = p.trim();
      if (content.length > 0) chunks.push({ content });
    });
  }

  console.log(`Embedding ${chunks.length} chunks…`);

  const embedModel = google.textEmbeddingModel("text-embedding-004");

  for (let i = 0; i < chunks.length; i += 16) {
    const slice = chunks.slice(i, i + 16);
    const { embeddings: vecs } = await embedMany({
      model: embedModel,
      values: slice.map((c) => c.content),
    });

    await db.insert(embeddings).values(
      slice.map((c, idx) => ({
        content: c.content,
        // drizzle cannot insert number[] into vector directly → cast via raw SQL
        embedding: sql.raw(`${toPgvectorLiteral(vecs[idx])}::vector`),
      }))
    );
    console.log(`Inserted ${i + slice.length}/${chunks.length}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
