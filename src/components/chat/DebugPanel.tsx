"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronUp,
  Bug,
  BarChart2,
  Clock,
  Search,
  FileText,
  Timer,
} from "lucide-react";

// Define types for debug information
interface DebugStep {
  step: string;
  message: string;
  timestamp: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  chunkId: string;
  content: string;
}

interface SimilarityScore {
  documentId: string;
  chunkId: string;
  score: number;
  content: string;
}

interface Timing {
  total: number;
  retrieval: number;
  llmProcessing: number;
}

interface DebugInfo {
  hasDocuments: boolean;
  retrievedDocuments: DocumentInfo[] | null;
  similarityScores: SimilarityScore[] | null;
  timing?: Timing;
  processSteps: DebugStep[];
}

export default function DebugPanel({
  debugInfo,
  active = false,
  onToggle,
}: {
  debugInfo: DebugInfo;
  active?: boolean;
  onToggle?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("process");

  if (!debugInfo) {
    return null;
  }

  return (
    <div className="border-t bg-muted/30">
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">RAG Process Debug</span>
          {debugInfo.timing && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center">
              <Timer className="h-3 w-3 mr-1" />
              {Math.round(debugInfo.timing.total)}ms total
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {active ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </Button>
      </div>

      {active && (
        <div className="p-2">
          <Card className="bg-card">
            <CardHeader className="p-3 pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="process" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Steps
                  </TabsTrigger>
                  <TabsTrigger value="timing" className="text-xs">
                    <Timer className="h-3 w-3 mr-1" />
                    Timing
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="similarity" className="text-xs">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    Similarity
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-3">
              <TabsContent value="process" className="mt-0">
                <div className="text-xs space-y-2">
                  <h4 className="font-medium">Process Timeline</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {debugInfo.processSteps.map((step, index) => (
                        <div
                          key={index}
                          className="border rounded p-2 bg-muted/30"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {step.step.replace(/_/g, " ")}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(step.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="mt-1">{step.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="timing" className="mt-0">
                <div className="text-xs space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  
                  {debugInfo.timing && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Total Processing Time</span>
                          <span className="font-mono">{Math.round(debugInfo.timing.total)}ms</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Document Retrieval</span>
                          <span className="font-mono">{Math.round(debugInfo.timing.retrieval)}ms</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${debugInfo.timing.total ? (debugInfo.timing.retrieval / debugInfo.timing.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>LLM Processing</span>
                          <span className="font-mono">{Math.round(debugInfo.timing.llmProcessing)}ms</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-amber-500 h-2 rounded-full" 
                            style={{ 
                              width: `${debugInfo.timing.total ? (debugInfo.timing.llmProcessing / debugInfo.timing.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Other Processing</span>
                          <span className="font-mono">
                            {Math.round(debugInfo.timing.total - debugInfo.timing.retrieval - debugInfo.timing.llmProcessing)}ms
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${debugInfo.timing.total ? 
                                ((debugInfo.timing.total - debugInfo.timing.retrieval - debugInfo.timing.llmProcessing) / debugInfo.timing.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="text-xs space-y-2">
                  <h4 className="font-medium">Retrieved Documents</h4>
                  <ScrollArea className="h-[200px]">
                    {debugInfo.retrievedDocuments &&
                    debugInfo.retrievedDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {debugInfo.retrievedDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="border rounded p-2 bg-muted/30"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {doc.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Chunk {index + 1}
                              </span>
                            </div>
                            <Separator className="my-1" />
                            <p className="mt-1 whitespace-pre-wrap">
                              {doc.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          No documents retrieved
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="similarity" className="mt-0">
                <div className="text-xs space-y-2">
                  <h4 className="font-medium">Similarity Ranking</h4>
                  <ScrollArea className="h-[200px]">
                    {debugInfo.similarityScores && debugInfo.similarityScores.length > 0 ? (
                      <div className="space-y-2">
                        {debugInfo.similarityScores.map((score, index) => (
                          <div
                            key={index}
                            className="border rounded p-2 bg-muted/30"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                Document {score.documentId.substring(0, 8)}
                              </span>
                              <div className="flex items-center gap-1">
                                <Search className="h-3 w-3" />
                                <span className="font-mono">
                                  {(score.score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-1 mb-2">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{
                                  width: `${score.score * 100}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {score.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          No similarity scores available
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 