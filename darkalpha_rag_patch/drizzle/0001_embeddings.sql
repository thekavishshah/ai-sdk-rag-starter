-- drizzle/0001_embeddings.sql
create extension if not exists pgvector;

create table if not exists embeddings (
  id serial primary key,
  content text not null,
  embedding vector(768) not null
);
