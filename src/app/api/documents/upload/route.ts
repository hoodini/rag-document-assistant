import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
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

    // Prepare response data
    const document = {
      id: uuidv4(), // Generate a client-side ID
      name: file.name,
      type: file.type,
      size: file.size,
      path: fileName,
      created_at: new Date().toISOString(),
      url: urlData.publicUrl,
    };

    // Process document for embeddings
    // This would be where you'd call a function to process the document with LangChain/Cohere
    
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error in document upload route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 