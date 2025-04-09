import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getLLM, getEmbeddings, createInsightChain, formatDocumentsAsString } from "@/lib/langchain/chain";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";

// Similar to the chat route, create a retriever for documents
async function createRetriever() {
  try {
    const { data: files, error } = await supabase.storage.from("documents").list();
    
    if (error) {
      console.error("Error retrieving documents:", error);
      throw new Error("Failed to retrieve documents");
    }
    
    if (files.length === 0) {
      throw new Error("No documents found");
    }
    
    // For this example, we'll use placeholder text as in the chat route
    const sampleText = `
      This is placeholder text representing multiple documents.
      The documents contain information about technology, finance, and healthcare.
      There are references to Company X and their innovative products.
      The overall sentiment is positive with opportunities for growth.
    `;
    
    // Create a mock retriever that returns documents
    const mockRetriever = {
      invoke: async () => {
        return [
          new Document({ 
            pageContent: sampleText,
            metadata: { source: "placeholder" }
          })
        ];
      },
      pipe: (fn: any) => ({
        invoke: async () => {
          const docs = await mockRetriever.invoke();
          return fn(docs);
        }
      })
    };
    
    return mockRetriever;
  } catch (error) {
    console.error("Error creating retriever:", error);
    throw error;
  }
}

// GET /api/insights - Generate insights from documents
export async function GET(request: NextRequest) {
  try {
    // Create retriever
    const retriever = await createRetriever();
    
    // Create insight chain
    const insightChain = createInsightChain(retriever);
    
    // Generate insights
    const insightContent = await insightChain.invoke({});
    
    // Format insights for response
    const insight = {
      id: uuidv4(),
      documentId: "all", // This would typically be a specific document ID
      content: insightContent,
      createdAt: new Date(),
    };
    
    return NextResponse.json(insight);
  } catch (error) {
    console.error("Error in insights route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
} 