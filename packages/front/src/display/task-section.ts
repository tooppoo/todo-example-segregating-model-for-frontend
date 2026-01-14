import type { DisplayTask } from "./display-task.js";

export type SectionType = "withDue" | "withoutDue";

export interface TaskSection {
  readonly type: SectionType;
  readonly label: string;
  readonly tasks: readonly DisplayTask[];
}

export function createTaskSection(
  type: SectionType,
  tasks: readonly DisplayTask[],
  label?: string
): TaskSection {
  return Object.freeze({
    type,
    label: label ?? getDefaultLabel(type),
    tasks: Object.freeze([...tasks]),
  });
}

function getDefaultLabel(type: SectionType): string {
  switch (type) {
    case "withDue":
      return "期限あり";
    case "withoutDue":
      return "期限なし";
  }
}

export function isSectionEmpty(section: TaskSection): boolean {
  return section.tasks.length === 0;
}

export function getSectionTaskCount(section: TaskSection): number {
  return section.tasks.length;
}
