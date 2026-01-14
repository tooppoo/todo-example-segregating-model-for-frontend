export const ViewType = {
  INBOX: "inbox",
  PROJECT: "project",
  TRASH: "trash",
} as const;

export type ViewType = (typeof ViewType)[keyof typeof ViewType];

export function isViewType(value: unknown): value is ViewType {
  return (
    typeof value === "string" &&
    Object.values(ViewType).includes(value as ViewType)
  );
}
