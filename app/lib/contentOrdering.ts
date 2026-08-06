export function prioritizeFeatured<T extends { featured?: boolean; order?: number; created_at?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    // 1. Sort by explicit order if provided (asc)
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    }
    if (typeof a.order === 'number') return -1;
    if (typeof b.order === 'number') return 1;

    // 2. Sort by featured status (desc)
    const aFeatured = Boolean(a.featured);
    const bFeatured = Boolean(b.featured);
    if (aFeatured !== bFeatured) {
      return Number(bFeatured) - Number(aFeatured);
    }

    // 3. Fallback to created_at (desc)
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return 0;
  });
}