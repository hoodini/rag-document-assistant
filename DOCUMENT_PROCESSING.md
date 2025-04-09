# Document Processing Implementation

This document explains how document processing, chunking, embedding, and retrieval are implemented in the RAG Document Assistant.

## Document Upload and Processing Pipeline

When a user uploads a document, the following process happens:

1. **Upload to Supabase Storage**
   - The document is uploaded to the Supabase storage bucket
   - A unique filename is generated using UUID to prevent conflicts

2. **Text Extraction**
   - The document content is extracted based on file type
   - For text files, we directly decode the content
   - For other file types (PDFs, DOCXs, etc.), we'd use specialized libraries
   - In the current implementation, we use a simplified placeholder for non-text files

3. **Text Chunking**
   - The extracted text is split into chunks of approximately 1000 characters
   - We use paragraph boundaries as natural split points
   - Chunks have a 200-character overlap to maintain context between chunks
   - Each chunk is treated as a separate document for retrieval purposes

4. **Embedding Generation**
   - We use Cohere's embedding model to generate embeddings for each chunk
   - These embeddings are vector representations of the text content
   - In a production environment, these would be stored in a vector database

5. **Storage in Supabase**
   - Chunks and their metadata are stored in the `document_chunks` table
   - Each chunk is linked to its parent document via `document_id`
   - In a production environment, we would also store the embeddings using pgvector

## Retrieval Process

When a user asks a question, the following retrieval process occurs:

1. **Query Embedding**
   - The user's question is embedded using the same Cohere model
   - This creates a vector representation of the question

2. **Similarity Search**
   - In a production environment, this would search for chunks with similar embeddings
   - The current implementation returns a simplified set of chunks

3. **Document Retrieval**
   - The most relevant chunks are returned to the LLM
   - These provide context for answering the user's question

4. **Response Generation**
   - The LLM (Cohere) uses the retrieved chunks to generate a response
   - If no relevant documents are found, it falls back to a general response

## Document Deletion

When a user deletes a document:

1. The document file is removed from Supabase storage
2. All associated chunks and embeddings are deleted from the database

## Production Considerations

For a production implementation, we recommend:

1. **Vector Database**
   - Use Supabase's pgvector extension or a dedicated vector database
   - This enables efficient similarity search on embeddings

2. **Better Text Extraction**
   - Use specialized libraries for different document types:
     - `pdf-parse` for PDF files
     - `mammoth` for DOCX files
     - `html-to-text` for HTML files

3. **Improved Chunking**
   - Use more sophisticated chunking strategies based on document structure
   - Consider semantic chunking that preserves logical units

4. **Metadata Enrichment**
   - Store additional metadata about chunks
   - Include information like chapter, section, or document structure

5. **Security**
   - Implement document ownership and access control
   - Apply encryption for sensitive documents

## Schema

The database schema for document processing includes:

```sql
CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- In a production app, add a vector column:
-- ADD COLUMN embedding vector(1536);
```

For full schema details, see `sql/schema.sql`. 