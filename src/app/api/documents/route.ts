import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/documents - Fetch all documents
export async function GET() {
  try {
    // Get list of documents from Supabase storage
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from("documents")
      .list();

    if (bucketError) {
      console.error("Error fetching documents:", bucketError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    // Generate URLs for each file
    const documents = await Promise.all(
      bucketFiles.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(file.name);

        return {
          id: file.id,
          name: file.name,
          type: file.metadata?.mimetype || "unknown",
          size: file.metadata?.size || 0,
          path: file.name,
          created_at: file.created_at,
          url: urlData.publicUrl,
        };
      })
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error in documents GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 