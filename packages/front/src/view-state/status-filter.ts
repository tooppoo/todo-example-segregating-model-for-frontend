export const StatusFilter = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export type StatusFilter = (typeof StatusFilter)[keyof typeof StatusFilter];

export function isStatusFilter(value: unknown): value is StatusFilter {
  return (
    typeof value === "string" &&
    Object.values(StatusFilter).includes(value as StatusFilter)
  );
}
