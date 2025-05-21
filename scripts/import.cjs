#!/usr/bin/env node
const fs = require("fs");
const { db } = require("../lib/db");
const { embeddings } = require("../lib/db/schema/embeddings");
const { embedMany } = require("ai");
const { google } = require("@ai-sdk/google");
const { toPgvectorLiteral } = require("../lib/utils/pgvector");

(async () => {
  const docs = JSON.parse(fs.readFileSync("data/siteContent.json", "utf8"));

  // embed in batches of 96 (Gemini limit = 100 values per request)
  const batches = [];
  while (docs.length) batches.push(docs.splice(0, 96));

  for (const batch of batches) {
    const { embeddings: vecs } = await embedMany({
      model: google.textEmbeddingModel("text-embedding-004"),
      values: batch.map(d => d.content),
    });

    // insert
    const rows = batch.map((d, i) => ({
      content: d.content,
      embedding: db.raw(
        `${toPgvectorLiteral(vecs[i])}::vector`
      ),
    }));
    await db.insert(embeddings).values(rows);
    console.log("Inserted", rows.length, "rows");
  }

  console.log("✅ All done");
  process.exit(0);
})();
