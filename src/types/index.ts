export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  created_at: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentInsight {
  id: string;
  documentId: string;
  content: string;
  createdAt: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export type InsightType = 'topics' | 'entities' | 'sentiment' | 'summary'; 