"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import SetupInstructions from "@/components/setup/SetupInstructions";

export default function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUploading, setIsUploading } = useAppStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      e.target.value = ""; // Reset input value
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload ${file.name}`, {
            cause: errorData
          });
        }
        
        return response.json();
      });
      
      await Promise.all(uploadPromises);
      toast.success("Files uploaded successfully");
      setFiles([]);
    } catch (error: any) {
      console.error("Upload error:", error);
      
      // Check for storage bucket error
      const isBucketError = 
        error.cause?.error === "Bucket not found" || 
        error.message?.includes("Bucket not found") ||
        error.cause?.message?.includes("Bucket not found");
      
      if (isBucketError) {
        setError("Storage bucket not found. You need to run the setup process first.");
      } else {
        setError(error.message || "Failed to upload files");
        toast.error("Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop files or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 border rounded-md bg-destructive/10 text-destructive flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{error}</p>
              {error.includes("setup") && (
                <div className="pt-2">
                  <SetupInstructions />
                </div>
              )}
            </div>
          </div>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOCX, TXT, CSV, and more
          </p>
          <Input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Files</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                >
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </Button>
      </CardFooter>
    </Card>
  );
} 