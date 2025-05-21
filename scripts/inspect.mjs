import { pool } from "../lib/db/index.js";
import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import pg from "pg";
import { sql } from "drizzle-orm/pg-core";

const embedModel = google.textEmbeddingModel("text-embedding-004");
const query = "Who owns Dark Alpha Capital?";

const { embeddings: [qEmb] } = await embedMany({ model: embedModel, values: [query] });
const vectorParam = `[${qEmb.join(",")}]`;

const { rows } = await pool.query(
  "SELECT content, embedding <-> $1::vector AS score FROM embeddings ORDER BY score LIMIT 5",
  [vectorParam]
);

console.table(rows);
process.exit();
