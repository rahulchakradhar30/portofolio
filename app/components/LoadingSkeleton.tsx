"use client";

export default function LoadingSkeleton({
  variant = "cards",
  count = 3,
}: {
  variant?: "hero" | "about" | "cards" | "contact";
  count?: number;
}) {
  if (variant === "hero") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#0b0f19] pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-4 sm:px-6 md:px-10 lg:grid-cols-2 lg:px-14 2xl:px-24">
          <div className="space-y-4">
            <div className="h-8 w-44 animate-pulse rounded-full bg-cyan-100/16" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-white/10" />
            <div className="h-16 w-4/5 animate-pulse rounded-xl bg-white/10" />
            <div className="h-8 w-2/3 animate-pulse rounded-xl bg-white/8" />
            <div className="mt-6 flex gap-3">
              <div className="h-11 w-36 animate-pulse rounded-full bg-cyan-100/16" />
              <div className="h-11 w-36 animate-pulse rounded-full bg-white/8" />
            </div>
          </div>
          <div className="mx-auto h-[290px] w-[290px] animate-pulse rounded-full bg-white/8 sm:h-[360px] sm:w-[360px] xl:h-[430px] xl:w-[430px]" />
        </div>
      </section>
    );
  }

  if (variant === "about") {
    return (
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="mb-8 h-10 w-64 rounded-xl bg-white/10" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 w-4/5 rounded bg-white/10" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 rounded bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "contact") {
    return (
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-8 w-56 rounded bg-white/10" />
            <div className="h-20 rounded bg-white/10" />
            <div className="h-14 rounded bg-white/10" />
            <div className="h-14 rounded bg-white/10" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow">
            <div className="h-10 w-48 rounded bg-white/10" />
            <div className="mt-4 space-y-3">
              <div className="h-12 rounded bg-white/10" />
              <div className="h-12 rounded bg-white/10" />
              <div className="h-28 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6 shadow-md">
          <div className="h-40 rounded-2xl bg-white/10" />
          <div className="mt-4 h-6 w-2/3 rounded bg-white/10" />
          <div className="mt-3 h-4 rounded bg-white/10" />
          <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
          <div className="mt-5 flex gap-2">
            <div className="h-8 w-16 rounded-full bg-white/10" />
            <div className="h-8 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
