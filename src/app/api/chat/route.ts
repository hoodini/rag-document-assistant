import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getLLM, createQAChain, formatDocumentsAsString } from "@/lib/langchain/chain";
import { retrieveDocuments } from "@/lib/document-utils";

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

    // Check if we have any documents in Supabase
    const { data: documents, error } = await supabase
      .from('document_chunks')
      .select('id')
      .limit(1);

    if (error) {
      console.error("Error checking for documents:", error);
      return NextResponse.json(
        { error: "Failed to check for documents" },
        { status: 500 }
      );
    }

    let response;

    if (documents && documents.length > 0) {
      // We have documents - use RAG
      // Create a custom retriever that uses our retrieveDocuments function
      const retriever = {
        invoke: async () => retrieveDocuments(message),
        pipe: (fn: any) => ({
          invoke: async () => {
            const docs = await retriever.invoke();
            return fn(docs);
          }
        })
      };

      // Create QA chain
      const qaChain = createQAChain(retriever);
      
      // Get response from the chain
      response = await qaChain.invoke({
        question: message,
      });
    } else {
      // No documents - just use the LLM directly
      const llm = getLLM();
      response = await llm.invoke(
        `You are a helpful AI assistant. User doesn't have any documents uploaded yet.
        Answer the following question:
        ${message}`
      );
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
} 