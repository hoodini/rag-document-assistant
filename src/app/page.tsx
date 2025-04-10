"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import ChatUI from "@/components/chat/ChatUI";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import InsightsDashboard from "@/components/insights/InsightsDashboard";
import SetupInstructions from "@/components/setup/SetupInstructions";

export default function Home() {
  const { currentView } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    
    // Check if database is set up
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/documents", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        // If we get an error, suggest setup
        if (!response.ok) {
          setShowSetup(true);
        }
      } catch (error) {
        console.error("Error checking setup:", error);
        setShowSetup(true);
      }
    };
    
    checkSetup();
  }, []);

  if (!mounted) return null;

  return (
    <MainLayout>
      {showSetup && (
        <div className="mb-4 p-4 rounded-lg border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Database Setup Required</h2>
              <p className="text-sm text-muted-foreground">
                You need to set up your Supabase database and storage before using this application.
              </p>
            </div>
            <SetupInstructions />
          </div>
        </div>
      )}
      
      {currentView === "chat" && <ChatUI />}
      {currentView === "documents" && (
        <div className="space-y-6">
          <DocumentUpload />
          <DocumentList />
        </div>
      )}
      {currentView === "insights" && <InsightsDashboard />}
    </MainLayout>
  );
}
