"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, Chat } from "@/types";
import { Send, Plus, Loader2, Bug } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ErrorFallback from "./ErrorFallback";
import DebugPanel from "./DebugPanel";

// Define types for debug information
interface DebugInfo {
  hasDocuments: boolean;
  retrievedDocuments: Array<{
    id: string;
    name: string;
    chunkId: string;
    content: string;
  }> | null;
  similarityScores: Array<{
    documentId: string;
    chunkId: string;
    score: number;
    content: string;
  }> | null;
  timing: {
    total: number;
    retrieval: number;
    llmProcessing: number;
  };
  processSteps: Array<{
    step: string;
    message: string;
    timestamp: string;
  }>;
}

export default function ChatUI() {
  const {
    currentChat,
    addChat,
    addMessageToCurrentChat,
    isLoadingChat,
    setIsLoadingChat,
  } = useAppStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState<{ message: string; isSetupError: boolean } | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  // Create a new chat if none exists
  const ensureActiveChat = () => {
    if (!currentChat) {
      const newChat: Chat = {
        id: uuidv4(),
        title: "New Chat",
        messages: [
          {
            id: uuidv4(),
            role: "system",
            content: 
              "You are a helpful AI assistant that can answer questions about the user's documents.",
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addChat(newChat);
      return true;
    }
    return false;
  };

  // Start a new chat
  const handleNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: 
            "You are a helpful AI assistant that can answer questions about the user's documents.",
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addChat(newChat);
    setInput("");
    setError(null);
    setDebugInfo(null);
  };

  // Retry after error
  const handleRetry = () => {
    setError(null);
  };

  // Toggle debug panel
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Clear any previous errors
    setError(null);
    setDebugInfo(null);
    
    // Create a new chat if none exists
    const isNewChat = ensureActiveChat();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };
    
    addMessageToCurrentChat(userMessage);
    setInput("");
    setIsLoadingChat(true);
    
    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          chatId: currentChat?.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Check if this is likely a setup error
        const isSetupError = 
          errorData.details?.includes("document_chunks") || 
          response.status === 500;
        
        throw new Error(errorData.error || "Failed to send message", { 
          cause: { isSetupError, details: errorData.details } 
        });
      }
      
      const data = await response.json();
      
      // Store debug info if available
      if (data.debug) {
        setDebugInfo(data.debug);
        // Automatically show debug panel when data is available
        setShowDebugPanel(true);
      }
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
      };
      
      addMessageToCurrentChat(aiMessage);
      
      // Update chat title for new chats
      if (isNewChat) {
        // TODO: Implement updating chat title based on first message
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Set error state for UI
      setError({
        message: error.message || "Sorry, there was an error processing your request.",
        isSetupError: error.cause?.isSetupError || false
      });
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
        createdAt: new Date(),
      };
      
      addMessageToCurrentChat(errorMessage);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  // Show error UI if needed
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <ErrorFallback 
          message={error.message}
          retry={handleRetry}
          showSetupButton={error.isSetupError}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">
          {currentChat ? currentChat.title : "New Chat"}
        </h2>
        <div className="flex items-center gap-2">
          {debugInfo && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDebugPanel}
              className="flex items-center gap-1"
            >
              <Bug className="h-4 w-4" />
              {showDebugPanel ? "Hide" : "Show"} Debug
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4">
            {!currentChat || currentChat.messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium mb-2">
                  Start a conversation
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Ask questions about your documents or get insights about your data.
                </p>
              </div>
            ) : (
              currentChat.messages
                .filter((msg) => msg.role !== "system")
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
            )}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Debug panel */}
      {debugInfo && (
        <DebugPanel 
          debugInfo={debugInfo} 
          active={showDebugPanel} 
          onToggle={toggleDebugPanel}
        />
      )}
      
      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoadingChat}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoadingChat}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 