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
      <section className="relative min-h-screen overflow-hidden bg-[#fbf7f0] pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-4 sm:px-6 md:px-10 lg:grid-cols-2 lg:px-14 2xl:px-24">
          <div className="space-y-4">
            <div className="skeleton-shimmer h-8 w-44 rounded-full" />
            <div className="skeleton-shimmer h-16 w-full rounded-xl" />
            <div className="skeleton-shimmer h-16 w-4/5 rounded-xl" />
            <div className="skeleton-shimmer h-8 w-2/3 rounded-xl" />
            <div className="mt-6 flex gap-3">
              <div className="skeleton-shimmer h-11 w-36 rounded-full" />
              <div className="skeleton-shimmer h-11 w-36 rounded-full" />
            </div>
          </div>
          <div className="skeleton-shimmer mx-auto h-[290px] w-[290px] rounded-full sm:h-[360px] sm:w-[360px] xl:h-[430px] xl:w-[430px]" />
        </div>
      </section>
    );
  }

  if (variant === "about") {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="skeleton-shimmer mb-8 h-10 w-64 rounded-xl" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 rounded" />
            <div className="skeleton-shimmer h-4 rounded" />
            <div className="skeleton-shimmer h-4 w-4/5 rounded" />
          </div>
          <div className="rounded-3xl border border-[#7a5f47]/10 bg-white p-8 shadow">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton-shimmer h-16 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "contact") {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="skeleton-shimmer h-8 w-56 rounded" />
            <div className="skeleton-shimmer h-20 rounded" />
            <div className="skeleton-shimmer h-14 rounded" />
            <div className="skeleton-shimmer h-14 rounded" />
          </div>
          <div className="rounded-3xl border border-[#7a5f47]/10 bg-white p-6 shadow">
            <div className="skeleton-shimmer h-10 w-48 rounded" />
            <div className="mt-4 space-y-3">
              <div className="skeleton-shimmer h-12 rounded" />
              <div className="skeleton-shimmer h-12 rounded" />
              <div className="skeleton-shimmer h-28 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-[#7a5f47]/10 bg-white p-6 shadow-md">
          <div className="skeleton-shimmer h-40 rounded-2xl" />
          <div className="skeleton-shimmer mt-4 h-6 w-2/3 rounded" />
          <div className="skeleton-shimmer mt-3 h-4 rounded" />
          <div className="skeleton-shimmer mt-2 h-4 w-5/6 rounded" />
          <div className="mt-5 flex gap-2">
            <div className="skeleton-shimmer h-8 w-16 rounded-full" />
            <div className="skeleton-shimmer h-8 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
