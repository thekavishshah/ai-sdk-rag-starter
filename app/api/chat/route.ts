import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { embedMany, streamText } from "ai";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { embeddings } from "@/lib/db/schema/embeddings";
import { toPgvectorLiteral } from "@/lib/utils/pgvector";

// Gemini models
const chatModel  = google("gemini-1.5-flash-001");     // cheap + fast
const embedModel = google.textEmbeddingModel("text-embedding-004");

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const query = messages.at(-1)!.content;

  /** 1) embed the query */
  const { embeddings: [qEmb] } = await embedMany({
    model: embedModel,
    values: [query],
  });

  /** 2) prepare a Postgres‐valid vector literal */
  const qVec = sql`${toPgvectorLiteral(qEmb)}::vector`;

  /** 3) retrieve top-5 chunks */
  const rows = await db
    .select({
      content: embeddings.content,
      score: sql`embedding <-> ${qVec}`,
    })
    .from(embeddings)
    .orderBy(sql`embedding <-> ${qVec}`)
    .limit(5);

  const context = rows.map(r => r.content).join("\n\n");

  /** 4) stream Gemini’s answer */
  const stream = streamText({
    model: chatModel,
    messages: [
      {
        role: "system",
        content:
          `You are an expert on Dark Alpha Capital. Answer *only* from the context below.\n\n${context}`,
      },
      ...messages,
    ],
  });

  return stream.toDataStreamResponse();   // <-- what useChat() expects
}
