"use client";

import { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Search, Sparkles } from "lucide-react";
import { getSiteCopy } from "@/app/lib/siteCopy";

type PaletteAction = {
  id: string;
  label: string;
  run: () => void;
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === "Escape") {
        closePalette();
      }
    };

    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, [closePalette]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const contentRes = await fetch("/api/admin/content");

        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (contentData.content) {
            setSiteCopy(getSiteCopy(contentData.content));
          }
        }
      } catch {
        // Keep command palette functional even if remote actions cannot be fetched.
      }
    };

    loadData();
  }, [router]);

  const staticActions = useMemo<PaletteAction[]>(
    () => [
      {
        id: "home",
        label: `Go to ${siteCopy.navHome}`,
        run: () => {
          router.push("/#home");
          setOpen(false);
        },
      },
      {
        id: "about",
        label: `Go to ${siteCopy.navAbout}`,
        run: () => {
          router.push("/#about");
          setOpen(false);
        },
      },
      {
        id: "radar",
        label: `Go to ${siteCopy.navRadar}`,
        run: () => {
          router.push("/#radar");
          setOpen(false);
        },
      },
      {
        id: "skills",
        label: `Open ${siteCopy.navSkills} Page`,
        run: () => {
          router.push("/skills");
          setOpen(false);
        },
      },
      {
        id: "projects",
        label: `Open ${siteCopy.navProjects} Page`,
        run: () => {
          router.push("/projects");
          setOpen(false);
        },
      },
      {
        id: "contact",
        label: `Go to ${siteCopy.navContact}`,
        run: () => {
          router.push("/#contact");
          setOpen(false);
        },
      },
      {
        id: "hire",
        label: `Open ${siteCopy.navHire} Page`,
        run: () => {
          router.push("/hire");
          setOpen(false);
        },
      },
    ],
    [router, siteCopy]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return staticActions;
    return staticActions.filter((action) => action.label.toLowerCase().includes(term));
  }, [query, staticActions]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-md"
          onClick={closePalette}
        >
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-20 w-[92%] max-w-3xl rounded-3xl border border-cyan-300/20 bg-[#07101a]/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Search className="h-5 w-5 text-cyan-200" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actions or pages..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
              />
              <div className="hidden items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-slate-300 sm:flex">
                <Command className="h-3.5 w-3.5" />K
              </div>
            </div>

            <div className="mt-3 max-h-[56vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-5 text-center text-sm text-slate-400">No actions found for &quot;{query}&quot;</div>
              ) : (
                filtered.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.run}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2 text-sm text-cyan-50 sm:text-[15px]">
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                      {action.label}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}