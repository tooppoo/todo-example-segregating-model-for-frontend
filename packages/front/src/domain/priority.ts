export const Priority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

const priorityOrder: Record<Priority, number> = {
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
  [Priority.NONE]: 0,
};

export function comparePriority(a: Priority, b: Priority): number {
  return priorityOrder[b] - priorityOrder[a];
}

export function isPriority(value: unknown): value is Priority {
  return (
    typeof value === "string" &&
    Object.values(Priority).includes(value as Priority)
  );
}
