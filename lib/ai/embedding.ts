import { embedMany } from "ai";
import { google } from "@ai-sdk/google";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

function chunkText(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((p) => p.split("."))
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function generateEmbeddings(content: string) {
  const chunks = chunkText(content);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({
    content: chunks[i],
    embedding: e,
  }));
}
