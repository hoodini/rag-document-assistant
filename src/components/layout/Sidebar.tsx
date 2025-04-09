"use client";

import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  FileText, 
  BarChart, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    currentView, 
    setCurrentView,
    chats
  } = useAppStore();

  const navItems = [
    {
      label: "Chat",
      icon: <MessageSquare className="h-5 w-5" />,
      view: "chat" as const,
    },
    {
      label: "Documents",
      icon: <FileText className="h-5 w-5" />,
      view: "documents" as const,
    },
    {
      label: "Insights",
      icon: <BarChart className="h-5 w-5" />,
      view: "insights" as const,
    },
  ];

  return (
    <aside className="h-full bg-secondary/20 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h2 
          className={`font-semibold text-xl ${!sidebarOpen ? "hidden" : "block"}`}
        >
          RAG Assistant
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="hidden md:flex"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.view}>
              <Button
                variant={currentView === item.view ? "secondary" : "ghost"}
                className={`w-full justify-${sidebarOpen ? "start" : "center"}`}
                onClick={() => setCurrentView(item.view)}
              >
                {item.icon}
                {sidebarOpen && (
                  <span className="ml-2">{item.label}</span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      {sidebarOpen && (
        <>
          <Separator />
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">Recent Chats</h3>
            <ul className="space-y-1">
              {chats.slice(0, 5).map((chat) => (
                <li key={chat.id}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-xs truncate"
                  >
                    <MessageSquare className="h-3 w-3 mr-2" />
                    {chat.title}
                  </Button>
                </li>
              ))}
              {chats.length === 0 && (
                <p className="text-xs text-muted-foreground">No recent chats</p>
              )}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
} 