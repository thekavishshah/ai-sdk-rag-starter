import {
  pgTable,
  serial,
  text,
  vector,
} from "drizzle-orm/pg-core";

export const embeddings = pgTable("embeddings", {
  id:       serial("id").primaryKey(),
  content:  text("content").notNull(),
  /** pgvector column – 768-dim because Gemini embeds to 768 */
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
});
