export const SortType = {
  MANUAL: "manual",
  CREATED_AT: "createdAt",
  DUE_AT: "dueAt",
  PRIORITY: "priority",
} as const;

export type SortType = (typeof SortType)[keyof typeof SortType];

export function isSortType(value: unknown): value is SortType {
  return (
    typeof value === "string" &&
    Object.values(SortType).includes(value as SortType)
  );
}
