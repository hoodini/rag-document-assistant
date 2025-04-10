import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/setup - Initialize required tables and storage
export async function POST() {
  try {
    // Step 1: Create document_chunks table if it doesn't exist
    let tableError;
    
    try {
      // First try using RPC (requires execute_sql function to be set up)
      const { error } = await supabase.rpc("execute_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            content TEXT NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create index if it doesn't exist
          CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id 
          ON public.document_chunks(document_id);
        `
      });
      
      tableError = error;
    } catch (error) {
      // If RPC fails, try direct SQL query
      const { error: directError } = await supabase.from('document_chunks').select('id').limit(1);
      
      // If table doesn't exist, we'll get a specific error
      if (directError && directError.code === '42P01') {
        console.log('Table does not exist, creating it using a script...');
        // We need to create the table - provide instructions
        tableError = {
          message: 'Table does not exist. Please run the SQL script manually in your Supabase dashboard SQL editor.',
          details: 'Copy the schema from sql/schema.sql and run it in the Supabase SQL editor.'
        };
      } else if (directError) {
        tableError = directError;
      }
    }

    if (tableError) {
      console.warn("Table setup warning:", tableError);
    }

    // Step 2: Create storage bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket("documents", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["text/plain", "text/markdown", "application/pdf", "application/json", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    });

    // Ignore error if bucket already exists
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error("Error creating bucket:", bucketError);
      
      if (tableError) {
        return NextResponse.json(
          { 
            error: "Failed to create table and bucket", 
            tableDetails: tableError,
            bucketDetails: bucketError,
            manualSetupInstructions: "1. Run the SQL from sql/schema.sql in Supabase SQL Editor\n2. Create a 'documents' bucket in Supabase Storage"
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create bucket", 
          details: bucketError,
          manualSetupInstructions: "Create a 'documents' bucket in Supabase Storage"
        },
        { status: 500 }
      );
    }

    if (tableError) {
      return NextResponse.json({ 
        partialSuccess: true, 
        message: "Storage bucket created, but database setup needs manual intervention",
        tableError: tableError,
        manualSetupInstructions: "Run the SQL from sql/schema.sql in Supabase SQL Editor"
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database and storage initialized successfully" 
    });
  } catch (error) {
    console.error("Error in setup route:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: (error as Error).message,
        manualSetupInstructions: "1. Run the SQL from sql/schema.sql in Supabase SQL Editor\n2. Create a 'documents' bucket in Supabase Storage" 
      },
      { status: 500 }
    );
  }
} 