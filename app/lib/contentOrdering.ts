export function prioritizeFeatured<T extends { featured?: boolean }>(items: T[]) {
  return [...items].sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)));
}