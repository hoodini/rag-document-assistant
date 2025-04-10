import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './langchain/chain';
import { supabase } from './supabase/client';

/**
 * Extract text from a file based on its MIME type
 * This is a simplified version. In a production app, you'd use libraries like pdf-parse, mammoth, etc.
 */
export async function extractTextFromFile(fileData: ArrayBuffer, mimeType: string): Promise<string> {
  // Convert ArrayBuffer to text
  const textDecoder = new TextDecoder('utf-8');
  
  try {
    // Simple text extraction based on MIME type
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'application/json') {
      return textDecoder.decode(fileData);
    }
    
    // For other file types (PDF, DOCX, etc.), we'd use specialized libraries
    // Since we don't have those libraries installed, we'll return a placeholder
    return `Extracted text from ${mimeType} file. 
This is placeholder text that would normally be extracted using specialized libraries.
In a production application, you would use libraries like:
- pdf-parse for PDF files
- mammoth for DOCX files
- html-to-text for HTML files`;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

/**
 * Split text into chunks for embedding
 * Simple implementation without using RecursiveCharacterTextSplitter
 */
export async function chunkText(text: string): Promise<string[]> {
  const chunkSize = 1000;
  const overlap = 200;
  const chunks: string[] = [];
  
  // Simple text splitting by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, push current chunk and start new one
    if (currentChunk.length + paragraph.length > chunkSize) {
      // Add current chunk to chunks array
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      const overlapText = words.slice(Math.max(0, words.length - overlap / 10)).join(' ');
      currentChunk = overlapText + ' ' + paragraph;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? ' ' : '') + paragraph;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Create documents from text chunks
 */
export function createDocumentsFromChunks(
  chunks: string[], 
  metadata: { 
    docId: string, 
    docName: string, 
    source: string 
  }
): Document[] {
  return chunks.map((chunk, i) => new Document({
    pageContent: chunk,
    metadata: {
      ...metadata,
      chunkId: i,
      chunkTotal: chunks.length,
    }
  }));
}

/**
 * Store document embeddings in Supabase
 * In a real application, you would use pgvector or another vector database
 */
export async function storeEmbeddings(
  documents: Document[], 
  documentId: string
): Promise<boolean> {
  try {
    const embeddings = getEmbeddings();
    
    // This would typically generate embeddings and store them in a vector database
    // For this example, we'll store the documents in Supabase as JSON
    
    // Create embeddings for each document (not used in this example)
    const vectors = await embeddings.embedDocuments(
      documents.map(doc => doc.pageContent)
    );
    
    // Store in Supabase - in a real app, we'd use pgvector
    // For this example, we'll just store the documents as JSON
    const { error } = await supabase
      .from('document_chunks')
      .insert(documents.map((doc, i) => ({
        id: `${documentId}-chunk-${i}`,
        document_id: documentId,
        content: doc.pageContent,
        metadata: doc.metadata,
        // In a real implementation with pgvector:
        // embedding: vectors[i]
      })));
    
    if (error) {
      console.error('Error storing embeddings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return false;
  }
}

/**
 * Process a document for RAG
 */
export async function processDocumentForRAG(
  fileData: ArrayBuffer,
  fileInfo: {
    id: string;
    name: string;
    type: string;
    path: string;
  }
): Promise<boolean> {
  try {
    // 1. Extract text from file
    const text = await extractTextFromFile(fileData, fileInfo.type);
    
    if (!text) {
      console.error('No text extracted from document');
      return false;
    }
    
    // 2. Split text into chunks
    const chunks = await chunkText(text);
    
    // 3. Create documents from chunks
    const documents = createDocumentsFromChunks(chunks, {
      docId: fileInfo.id,
      docName: fileInfo.name,
      source: fileInfo.path
    });
    
    // 4. Store embeddings
    const success = await storeEmbeddings(documents, fileInfo.id);
    
    return success;
  } catch (error) {
    console.error('Error processing document:', error);
    return false;
  }
}

/**
 * Retrieve documents based on a query
 * This is a simplified implementation
 */
export async function retrieveDocuments(query: string, includeDebug = false): Promise<{
  documents: Document[];
  debugData?: {
    similarityScores: {
      documentId: string,
      chunkId: string,
      score: number,
      content: string
    }[];
  }
}> {
  try {
    const embeddings = getEmbeddings();
    
    // Generate embedding for query
    console.log("Generating embedding for query:", query);
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // In a real implementation:
    // 1. Generate embedding for query
    // 2. Perform vector similarity search in pgvector
    
    // For this example, we'll just retrieve all document chunks
    // and simulate similarity ranking
    const { data, error } = await supabase
      .from('document_chunks')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error retrieving documents:', error);
      return { documents: [] };
    }
    
    // Simulate similarity scores (in a real app, this would be from vector search)
    // This is just random ranking for demonstration purposes
    const simulatedItems = data.map(item => ({
      ...item,
      // Random similarity score between 0.5 and 0.95
      similarity: Math.round((0.5 + Math.random() * 0.45) * 100) / 100
    }));
    
    // Sort by simulated similarity (highest first)
    simulatedItems.sort((a, b) => b.similarity - a.similarity);
    
    // Take top 5 chunks
    const topItems = simulatedItems.slice(0, 5);
    
    // Convert Supabase data to Documents
    const documents = topItems.map(item => new Document({
      pageContent: item.content,
      metadata: {
        ...(typeof item.metadata === 'object' ? item.metadata : {}),
        docId: item.document_id,
        docName: item.metadata?.docName || 'Unknown Document',
        chunkId: item.id,
        similarity: item.similarity
      }
    }));
    
    // Include debug information if requested
    if (includeDebug) {
      const debugData = {
        similarityScores: topItems.map(item => ({
          documentId: item.document_id,
          chunkId: item.id,
          score: item.similarity,
          content: item.content.substring(0, 100) + '...'
        }))
      };
      
      return { documents, debugData };
    }
    
    return { documents };
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return { documents: [] };
  }
}

/**
 * Delete document embeddings
 */
export async function deleteDocumentEmbeddings(documentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);
    
    if (error) {
      console.error('Error deleting document embeddings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting document embeddings:', error);
    return false;
  }
} 