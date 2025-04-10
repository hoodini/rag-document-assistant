"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import SetupInstructions from "@/components/setup/SetupInstructions";

interface ErrorFallbackProps {
  message?: string;
  retry?: () => void;
  showSetupButton?: boolean;
}

export default function ErrorFallback({ 
  message = "An error occurred while processing your request.", 
  retry,
  showSetupButton = false
}: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Error</CardTitle>
        </div>
        <CardDescription>
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSetupButton && (
          <div className="mb-4">
            <p className="text-sm mb-2">
              This error might be related to missing database tables or storage buckets. 
              Please run the setup process to configure your Supabase instance.
            </p>
            <SetupInstructions />
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          If this problem persists, please check the browser console for more details
          and ensure your Supabase credentials are correctly configured.
        </p>
      </CardContent>
      {retry && (
        <CardFooter>
          <Button onClick={retry} variant="outline" className="w-full">
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 