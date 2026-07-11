"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { firebaseDb } from "@/app/lib/firebaseClient";
import type { PortfolioContent, Project, Skill, Certification } from "@/app/lib/types";
import { DEFAULT_SITE_COPY } from "@/app/lib/siteCopy";

interface PortfolioContentContextType {
  content: PortfolioContent | null;
  loading: boolean;
  error: Error | null;
}

const PortfolioContentContext = createContext<PortfolioContentContextType>({
  content: null,
  loading: true,
  error: null,
});

export function PortfolioContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!firebaseDb) {
      // Fallback if client config is missing (e.g. dev environment without env vars)
      fetch("/api/admin/content")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load content from fallback API");
          return res.json();
        })
        .then((data) => {
          startTransition(() => {
            setContent(data.content || null);
            setLoading(false);
          });
        })
        .catch((err) => {
          console.error("Content fallback fetch error:", err);
          startTransition(() => {
            setError(err instanceof Error ? err : new Error("Failed to load content"));
            setLoading(false);
          });
        });
      return;
    }

    const q = query(collection(firebaseDb, "portfolio_content"), limit(1));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        startTransition(() => {
          if (snapshot.empty) {
            setContent(null);
          } else {
            const doc = snapshot.docs[0];
            setContent({ id: doc.id, ...doc.data() } as PortfolioContent);
          }
          setLoading(false);
          setError(null);
        });
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        startTransition(() => {
          setError(err);
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <PortfolioContentContext.Provider value={{ content, loading, error }}>
      {children}
    </PortfolioContentContext.Provider>
  );
}

export function usePortfolioContent() {
  return useContext(PortfolioContentContext);
}
