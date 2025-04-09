-- Schema for RAG Document Assistant

-- Table for storing document chunks and embeddings
CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index on document_id for faster lookup
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);

-- In a production application, you would use pgvector for vector search
-- Here's how you would set it up:

-- CREATE EXTENSION IF NOT EXISTS vector;
-- 
-- ALTER TABLE document_chunks 
-- ADD COLUMN embedding vector(1536);
-- 
-- CREATE INDEX idx_document_chunks_embedding ON document_chunks
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- 
-- Function to search for similar documents
-- CREATE OR REPLACE FUNCTION match_documents (
--   query_embedding vector(1536),
--   match_threshold FLOAT,
--   match_count INT
-- )
-- RETURNS TABLE (
--   id TEXT,
--   document_id TEXT,
--   content TEXT,
--   metadata JSONB,
--   similarity FLOAT
-- )
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT
--     dc.id,
--     dc.document_id,
--     dc.content,
--     dc.metadata,
--     1 - (dc.embedding <=> query_embedding) AS similarity
--   FROM document_chunks dc
--   WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
--   ORDER BY similarity DESC
--   LIMIT match_count;
-- END;
-- $$; 