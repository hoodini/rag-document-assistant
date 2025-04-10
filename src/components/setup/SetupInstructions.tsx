"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export default function SetupInstructions() {
  const [open, setOpen] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    table: boolean;
    bucket: boolean;
    message?: string;
  }>({
    table: false,
    bucket: false
  });

  const runSetup = async () => {
    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSetupStatus({
          table: true,
          bucket: true,
          message: "Setup completed successfully!"
        });
        toast.success("Database and storage initialized successfully");
      } else if (data.partialSuccess) {
        setSetupStatus({
          table: false,
          bucket: true,
          message: data.message
        });
        toast.warning("Partial setup: " + data.message);
      } else {
        setSetupStatus({
          table: false,
          bucket: false,
          message: data.error || "Unknown error occurred"
        });
        toast.error(`Setup failed: ${data.error || "Unknown error"}`);
        console.error("Setup error details:", data);
      }
    } catch (error) {
      setSetupStatus({
        table: false,
        bucket: false,
        message: "Failed to run setup. Check console for details."
      });
      toast.error("Failed to run setup");
      console.error("Setup error:", error);
    }
  };

  const schemaSQL = `-- Schema for RAG Document Assistant

-- Table for storing document chunks and embeddings
CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index on document_id for faster lookup
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-1.5">
          <Settings className="h-4 w-4" />
          Initialize Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>RAG Document Assistant Setup</DialogTitle>
          <DialogDescription>
            Follow these instructions to set up your Supabase database and storage
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Automatic Setup</TabsTrigger>
            <TabsTrigger value="manual">Manual Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="py-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <div className="min-w-5">
                  {setupStatus.table ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Database Table Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates the document_chunks table in Supabase
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="min-w-5">
                  {setupStatus.bucket ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Storage Bucket Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates the "documents" storage bucket in Supabase
                  </p>
                </div>
              </div>

              {setupStatus.message && (
                <div className="rounded-md bg-secondary p-4 text-sm">
                  {setupStatus.message}
                </div>
              )}

              <Button onClick={runSetup} className="w-full">
                Run Setup
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Create Database Table</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy this SQL and run it in your Supabase SQL Editor:
                </p>
                <ScrollArea className="h-[200px] rounded-md border p-4 bg-secondary">
                  <pre className="text-xs">{schemaSQL}</pre>
                </ScrollArea>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">2. Create Storage Bucket</h3>
                <ol className="text-sm space-y-2 list-decimal pl-5">
                  <li>In your Supabase dashboard, navigate to "Storage"</li>
                  <li>Click "Create a new bucket"</li>
                  <li>Name your bucket "documents"</li>
                  <li>Enable RLS (Row Level Security) if needed for your security model</li>
                  <li>Set bucket as public for this example application</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 