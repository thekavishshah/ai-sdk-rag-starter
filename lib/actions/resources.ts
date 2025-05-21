'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { db } from "@/lib/db";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { embeddings as embeddingsTable } from "@/lib/db/schema/embeddings";

export const createResource = async (input: NewResourceParams) => {
  const { content } = insertResourceSchema.parse(input);

  // 1) insert the resource
  const [resource] = await db
    .insert(resources)
    .values({ content })
    .returning();

  // 2) generate embeddings for each chunk
  const embs = await generateEmbeddings(content);

  // 3) bulk‐insert into embeddings table
  await db.insert(embeddingsTable).values(
    embs.map((e) => ({
      resourceId: resource.id,
      content: e.content,
      embedding: e.embedding,
    }))
  );

  return resource;
};
