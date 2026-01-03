"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 pattern-bg">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to Study Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Run this command in your terminal to get started:
          </p>
          <div className="bg-card rounded-xl p-6 card-shadow">
            <code className="text-lg font-mono text-primary font-semibold">
              npx convex dev
            </code>
          </div>
          <div className="text-left space-y-3 bg-card rounded-xl p-6 card-shadow">
            <p className="font-medium text-foreground">This will:</p>
            <ol className="space-y-2 text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Create a free Convex project
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                Deploy your database schema
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
                Enable real-time sync
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Use ClerkProvider and ConvexProvider separately
  // This avoids the 404 error from trying to fetch a "convex" JWT template
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
          card: "bg-card shadow-lg",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "bg-card border border-border hover:bg-muted",
          formFieldInput: "bg-background border-border",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      <ConvexProvider client={client}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}
