import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getLLM, getEmbeddings, createQAChain } from "@/lib/langchain/chain";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Helper function to get documents from Supabase
async function getDocuments() {
  const { data: files, error } = await supabase.storage.from("documents").list();
  
  if (error) {
    console.error("Error retrieving documents:", error);
    throw new Error("Failed to retrieve documents");
  }
  
  return files;
}

// Helper function to create a retriever from documents
async function createRetriever() {
  try {
    // Get files from Supabase
    const files = await getDocuments();
    
    if (files.length === 0) {
      throw new Error("No documents found");
    }
    
    // This is a simple implementation that would need to be expanded in a real app
    // In a real app, you'd want to:
    // 1. Download the actual files
    // 2. Extract text based on file type (PDF, DOCX, etc.)
    // 3. Split text into chunks
    // 4. Create embeddings
    
    // For this example, we'll use placeholder text
    const sampleText = `
      This is placeholder text representing multiple documents.
      In a real implementation, you would extract text from the actual documents.
      The documents would contain valuable information that can be retrieved.
      Questions about these documents can be answered using RAG techniques.
    `;
    
    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunks = await splitter.splitText(sampleText);
    
    // Create vector store with embeddings
    const embeddings = getEmbeddings();
    const vectorStore = await MemoryVectorStore.fromTexts(
      chunks,
      { id: "1", source: "placeholder" },
      embeddings
    );
    
    // Create and return retriever
    return vectorStore.asRetriever();
  } catch (error) {
    console.error("Error creating retriever:", error);
    throw error;
  }
}

// POST /api/chat - Chat with the RAG system
export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    // Create retriever
    const retriever = await createRetriever();
    
    // Create QA chain
    const qaChain = createQAChain(retriever);
    
    // Get response from the chain
    const response = await qaChain.invoke({
      question: message,
    });
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
} 