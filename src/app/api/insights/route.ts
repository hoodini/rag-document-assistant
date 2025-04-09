import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getLLM, createInsightChain } from "@/lib/langchain/chain";
import { retrieveDocuments } from "@/lib/document-utils";
import { v4 as uuidv4 } from "uuid";

// GET /api/insights - Generate insights from documents
export async function GET(request: NextRequest) {
  try {
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

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents found to generate insights" },
        { status: 404 }
      );
    }

    // Create a custom retriever that uses our retrieveDocuments function
    const retriever = {
      invoke: async () => retrieveDocuments(""), // Empty query to get all documents
      pipe: (fn: any) => ({
        invoke: async () => {
          const docs = await retriever.invoke();
          return fn(docs);
        }
      })
    };
    
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