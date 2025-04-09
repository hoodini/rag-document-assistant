import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { deleteDocumentEmbeddings } from "@/lib/document-utils";

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // First, get the file details to determine the path
    const { data: bucketFiles, error: listError } = await supabase.storage
      .from("documents")
      .list();

    if (listError) {
      console.error("Error listing documents:", listError);
      return NextResponse.json(
        { error: "Failed to list documents" },
        { status: 500 }
      );
    }

    // Find the file with the matching ID
    const fileToDelete = bucketFiles.find((file) => file.id === id);

    if (!fileToDelete) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([fileToDelete.name]);

    if (deleteError) {
      console.error("Error deleting document:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    // Delete document's embeddings
    const embeddingsDeleted = await deleteDocumentEmbeddings(id);
    
    if (!embeddingsDeleted) {
      console.warn(`Warning: Document file was deleted but embeddings deletion failed for document ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in document delete route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 