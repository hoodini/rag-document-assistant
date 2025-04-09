"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartData, InsightType } from "@/types";
import { BarChart, Share2, FileText, Loader2 } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartDataCollection {
  topics: ChartData;
  entities: ChartData;
  sentiment: ChartData;
  [key: string]: ChartData; // Index signature to allow indexing with string
}

export default function InsightsDashboard() {
  const { documents, insights, isLoadingInsights, setIsLoadingInsights } = useAppStore();
  const [activeTab, setActiveTab] = useState<InsightType>("topics");
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Generate sample chart data (replace with real data from the API)
  useEffect(() => {
    if (documents.length === 0) return;

    setIsLoadingInsights(true);

    // Mock data for demonstration purposes
    const generateMockChartData = (): ChartDataCollection => {
      const topics = {
        labels: ['Technology', 'Finance', 'Healthcare', 'Education', 'Environment'],
        datasets: [
          {
            label: 'Frequency',
            data: [65, 45, 35, 28, 20],
            backgroundColor: [
              'rgba(53, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderColor: [
              'rgba(53, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      const entities = {
        labels: ['Company X', 'Person Y', 'Organization Z', 'Product A', 'Location B'],
        datasets: [
          {
            label: 'Mentions',
            data: [52, 39, 30, 25, 18],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      const sentiment = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
          {
            label: 'Sentiment Distribution',
            data: [60, 30, 10],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(255, 99, 132, 0.7)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      return { topics, entities, sentiment };
    };

    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockChartData();
      // Only set chart data for tabs that have chart data
      if (activeTab !== 'summary') {
        setChartData(mockData[activeTab]);
      } else {
        setChartData(null);
      }
      setIsLoadingInsights(false);
    }, 1500);
  }, [documents, activeTab, setIsLoadingInsights]);

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Insights</CardTitle>
          <CardDescription>
            Upload documents to see insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground max-w-md">
              Upload documents to start generating insights and analytics about your data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Document Insights
        </CardTitle>
        <CardDescription>
          Analytics and insights from your uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="topics" value={activeTab} onValueChange={(value) => setActiveTab(value as InsightType)}>
          <TabsList className="mb-6">
            <TabsTrigger value="topics">Key Topics</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topics">
            <h3 className="text-lg font-medium mb-4">Key Topics</h3>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Analyzing topics...</span>
              </div>
            ) : chartData ? (
              <div className="h-[300px]">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            ) : null}
            <div className="mt-6">
              <h4 className="text-base font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Technology</span> is your most discussed topic. Consider focusing your research in this area.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Finance</span> and <span className="font-medium">Healthcare</span> have significant overlap. Explore the connection between these domains.
                  </p>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="entities">
            <h3 className="text-lg font-medium mb-4">Key Entities</h3>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Extracting entities...</span>
              </div>
            ) : chartData ? (
              <div className="h-[300px]">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            ) : null}
            <div className="mt-6">
              <h4 className="text-base font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Company X</span> appears frequently in your documents. Consider researching more about this organization.
                  </p>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment">
            <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Analyzing sentiment...</span>
              </div>
            ) : chartData ? (
              <div className="h-[300px]">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            ) : null}
            <div className="mt-6">
              <h4 className="text-base font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Your documents have a predominantly <span className="font-medium">positive</span> sentiment. The positive tone may help in persuasive contexts.
                  </p>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <h3 className="text-lg font-medium mb-4">Document Summary</h3>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Generating summary...</span>
              </div>
            ) : (
              <div className="prose max-w-none">
                <p>
                  Your documents primarily focus on technological advancements and their impact on various industries, with a particular emphasis on finance and healthcare sectors. There are recurring mentions of Company X and their product innovations. The overall tone is positive, highlighting opportunities rather than challenges.
                </p>
                <p className="mt-4">
                  Key themes include digital transformation, data analytics, and sustainable practices. The content suggests a forward-looking perspective on industry developments with practical applications of emerging technologies.
                </p>
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Consider exploring the intersection of technology and healthcare in more depth, as this appears to be an emerging theme in your documents.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        The documents would benefit from more concrete examples of real-world applications and case studies.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 