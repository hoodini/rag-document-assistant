"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop sidebar */
        <div
          className={`hidden md:block transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-4 h-full">{children}</div>
      </main>
    </div>
  );
} 