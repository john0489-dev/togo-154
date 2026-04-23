// Plan configuration — keep in sync with server-side enforcement in api.functions.ts
export type Plan = "free" | "pro";

export const PLAN_LIMITS = {
  free: {
    restaurants: 20,
    lists: 3,
  },
  pro: {
    restaurants: null as number | null, // unlimited
    lists: null as number | null,
  },
} as const;

export const PLAN_FEATURES = {
  free: {
    photos: false,
    notes: false,
    tags: false,
    advancedFilters: false, // price range, occasion
    visitHistory: false,
    collaborativeEdit: false,
    pdfExport: false,
    shareReadOnly: true,
  },
  pro: {
    photos: true,
    notes: true,
    tags: true,
    advancedFilters: true,
    visitHistory: true,
    collaborativeEdit: true,
    pdfExport: true,
    shareReadOnly: true,
  },
} as const;

export function canAddRestaurant(plan: Plan, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].restaurants;
  return limit === null || currentCount < limit;
}

export function canCreateList(plan: Plan, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].lists;
  return limit === null || currentCount < limit;
}
