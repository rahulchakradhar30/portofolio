"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface NavigationContextType {
  goBack: (fallbackUrl?: string) => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  goBack: () => {},
  canGoBack: false,
});

function SearchParamsTracker({ onChange }: { onChange: (search: string) => void }) {
  const searchParams = useSearchParams();
  const searchStr = searchParams ? searchParams.toString() : "";
  useEffect(() => {
    onChange(searchStr);
  }, [searchStr, onChange]);
  return null;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchStr, setSearchStr] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const initialMountRef = useRef(true);

  const handleSearchChange = useCallback((search: string) => {
    setSearchStr(search);
  }, []);

  // Track internal session history depth
  useEffect(() => {
    if (typeof window === "undefined") return;

    let count = Number(sessionStorage.getItem("internal_nav_count") || "0");
    if (initialMountRef.current) {
      initialMountRef.current = false;
      const isInternalReferrer = !!(document.referrer && document.referrer.includes(window.location.host));
      if (isInternalReferrer && count === 0) {
        count = 1;
      }
    }
    
    count += 1;
    sessionStorage.setItem("internal_nav_count", String(count));
    const ableToGoBack = count > 1 || (typeof document !== "undefined" && !!document.referrer && document.referrer.includes(window.location.host));
    queueMicrotask(() => {
      setCanGoBack(ableToGoBack);
    });
  }, [pathname, searchStr]);

  // Record scroll positions on current path — debounced to avoid synchronous
  // sessionStorage writes on every animation frame during active scrolling.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScrollSave = () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        const fullPath = window.location.pathname + window.location.search + window.location.hash;
        sessionStorage.setItem(`scroll_${fullPath}`, String(window.scrollY));
      }, 100);
    };

    window.addEventListener("scroll", handleScrollSave, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollSave);
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
    };
  }, [pathname, searchStr]);

  // Section Tracking on Home page ("/") using IntersectionObserver
  useEffect(() => {
    if (pathname !== "/" || typeof window === "undefined") return;

    const sections = ["home", "about", "roadmap", "radar", "skills", "projects", "certifications", "contact"];
    const sectionElements = sections.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const id = entry.target.id;
            const newHash = `#${id}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(
                window.history.state,
                "",
                `${window.location.pathname}${window.location.search}${newHash}`
              );
            }
          }
        });
      },
      { threshold: [0.3] }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Restore Scroll or Section Anchor on Route Change / Back Navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const restoreScrollOrHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          window.requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }
      }

      const fullPath = window.location.pathname + window.location.search + window.location.hash;
      const savedScroll = sessionStorage.getItem(`scroll_${fullPath}`);
      if (savedScroll) {
        const scrollY = Number(savedScroll);
        if (!isNaN(scrollY) && scrollY > 0) {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY, behavior: "auto" });
          });
        }
      }
    };

    const timer = setTimeout(restoreScrollOrHash, 120);
    window.addEventListener("popstate", restoreScrollOrHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", restoreScrollOrHash);
    };
  }, [pathname, searchStr]);

  const goBack = useCallback(
    (fallbackUrl = "/") => {
      if (typeof window === "undefined") return;

      const navCount = Number(sessionStorage.getItem("internal_nav_count") || "0");
      const hasInternalReferrer = !!(document.referrer && document.referrer.includes(window.location.host));

      if (navCount > 1 || hasInternalReferrer || window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackUrl);
      }
    },
    [router]
  );

  return (
    <NavigationContext.Provider value={{ goBack, canGoBack }}>
      <Suspense fallback={null}>
        <SearchParamsTracker onChange={handleSearchChange} />
      </Suspense>
      {children}
    </NavigationContext.Provider>
  );
}

export function useBackNavigation() {
  return useContext(NavigationContext);
}

export interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fallback?: string;
  children?: React.ReactNode;
}

export function BackButton({ fallback = "/", children, onClick, ...props }: BackButtonProps) {
  const { goBack } = useBackNavigation();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented) {
      e.preventDefault();
      goBack(fallback);
    }
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
