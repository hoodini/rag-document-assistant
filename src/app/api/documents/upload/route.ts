import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { processDocumentForRAG } from "@/lib/document-utils";
import { v4 as uuidv4 } from "uuid";

// POST /api/documents/upload - Upload a document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate a unique file name to prevent overwriting
    const fileName = `${uuidv4()}-${file.name}`;
    const docId = uuidv4(); // Generate ID for document tracking

    // Convert file to buffer for upload
    const buffer = await file.arrayBuffer();

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading document:", error);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);

    // Prepare document data
    const document = {
      id: docId,
      name: file.name,
      type: file.type,
      size: file.size,
      path: fileName,
      created_at: new Date().toISOString(),
      url: urlData.publicUrl,
    };

    // Process document for embeddings
    // We pass the buffer and document info to our processing utility
    const processSuccess = await processDocumentForRAG(buffer, {
      id: document.id,
      name: document.name,
      type: document.type,
      path: document.path,
    });

    // Even if processing fails, we return the document info since the file was uploaded
    if (!processSuccess) {
      console.warn("Warning: Document was uploaded but processing for embeddings failed");
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error in document upload route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 