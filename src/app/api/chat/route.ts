import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getLLM, createQAChain } from "@/lib/langchain/chain";
import { retrieveDocuments } from "@/lib/document-utils";

// Helper to track time
const timeTracker = () => {
  const start = performance.now();
  return {
    stop: () => {
      const end = performance.now();
      return end - start;
    }
  };
};

// Define debug info interface to fix type errors
interface DebugInfo {
  hasDocuments: boolean;
  retrievedDocuments: Array<{
    id: string;
    name: string;
    chunkId: string;
    content: string;
  }> | null;
  similarityScores: Array<{
    documentId: string;
    chunkId: string;
    score: number;
    content: string;
  }> | null;
  timing: {
    total: number;
    retrieval: number;
    llmProcessing: number;
  };
  processSteps: Array<{
    step: string;
    message: string;
    timestamp: string;
  }>;
}

// POST /api/chat - Chat with the RAG system
export async function POST(request: NextRequest) {
  const overallTimer = timeTracker();
  
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
    let debugInfo: DebugInfo = {
      hasDocuments: documents && documents.length > 0,
      retrievedDocuments: null,
      similarityScores: null,
      timing: {
        total: 0,
        retrieval: 0,
        llmProcessing: 0
      },
      processSteps: [
        { step: "query_received", message: "Received user query", timestamp: new Date().toISOString() }
      ]
    };

    if (documents && documents.length > 0) {
      // Debug info
      debugInfo.processSteps.push({
        step: "documents_found",
        message: "Found documents in database, proceeding with RAG",
        timestamp: new Date().toISOString()
      });

      try {
        // Time the retrieval process
        const retrievalTimer = timeTracker();
        
        // Retrieve documents - include debug info
        const { documents: retrievedDocs, debugData } = await retrieveDocuments(message, true);
        
        // Track retrieval time
        debugInfo.timing.retrieval = retrievalTimer.stop();
        
        // Add debug info
        debugInfo.retrievedDocuments = retrievedDocs.map(doc => ({
          id: doc.metadata.docId || "",
          name: doc.metadata.docName || "",
          chunkId: doc.metadata.chunkId || "",
          content: doc.pageContent.substring(0, 100) + '...'
        }));
        
        if (debugData?.similarityScores) {
          debugInfo.similarityScores = debugData.similarityScores;
        }
        
        debugInfo.processSteps.push({
          step: "documents_retrieved", 
          message: `Retrieved ${retrievedDocs.length} relevant document chunks in ${debugInfo.timing.retrieval.toFixed(0)}ms`, 
          timestamp: new Date().toISOString()
        });

        // Create a custom retriever that uses our results
        const retriever = {
          invoke: async () => retrievedDocs,
          pipe: (fn: any) => ({
            invoke: async () => {
              const docs = await retriever.invoke();
              return fn(docs);
            }
          })
        };

        // Debug step
        debugInfo.processSteps.push({
          step: "llm_processing",
          message: "Processing with LLM using RAG",
          timestamp: new Date().toISOString()
        });

        // Time the LLM processing
        const llmTimer = timeTracker();
        
        // Create QA chain
        const qaChain = createQAChain(retriever);
        
        // Get response from the chain
        response = await qaChain.invoke({
          question: message,
        });
        
        // Track LLM time
        debugInfo.timing.llmProcessing = llmTimer.stop();
        
        // Debug step
        debugInfo.processSteps.push({
          step: "response_generated",
          message: `Generated response using retrieved documents in ${debugInfo.timing.llmProcessing.toFixed(0)}ms`,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error in RAG process:", error);
        debugInfo.processSteps.push({
          step: "error",
          message: "Error in RAG process: " + (error as Error).message,
          timestamp: new Date().toISOString()
        });
        
        // Fallback to direct LLM
        const llmTimer = timeTracker();
        const llm = getLLM();
        response = await llm.invoke(
          `You are a helpful AI assistant. There was an error retrieving documents.
          Please answer the following question with general knowledge:
          ${message}`
        );
        debugInfo.timing.llmProcessing = llmTimer.stop();
      }
    } else {
      // No documents - just use the LLM directly
      debugInfo.processSteps.push({
        step: "no_documents",
        message: "No documents found in database, using direct LLM",
        timestamp: new Date().toISOString()
      });
      
      const llmTimer = timeTracker();
      const llm = getLLM();
      response = await llm.invoke(
        `You are a helpful AI assistant. User doesn't have any documents uploaded yet.
        Answer the following question:
        ${message}`
      );
      debugInfo.timing.llmProcessing = llmTimer.stop();
      
      debugInfo.processSteps.push({
        step: "response_generated",
        message: `Generated response using direct LLM (no documents) in ${debugInfo.timing.llmProcessing.toFixed(0)}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Track overall time
    debugInfo.timing.total = overallTimer.stop();
    
    return NextResponse.json({ 
      response,
      debug: debugInfo
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
} 