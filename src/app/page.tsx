"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import ChatUI from "@/components/chat/ChatUI";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentList from "@/components/documents/DocumentList";
import InsightsDashboard from "@/components/insights/InsightsDashboard";

export default function Home() {
  const { currentView } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MainLayout>
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
