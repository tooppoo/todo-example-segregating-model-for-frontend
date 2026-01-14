import type { Priority } from "../domain/priority.js";
import type { DueFilter } from "./due-filter.js";
import type { StatusFilter } from "./status-filter.js";

export interface FilterState {
  readonly query: string | null;
  readonly tags: readonly string[];
  readonly priority: Priority | null;
  readonly status: StatusFilter | null;
  readonly due: DueFilter | null;
}

export function createFilterState(
  params: Partial<FilterState> = {}
): FilterState {
  return Object.freeze({
    query: params.query ?? null,
    tags: Object.freeze(params.tags ?? []),
    priority: params.priority ?? null,
    status: params.status ?? null,
    due: params.due ?? null,
  });
}

export function isEmptyFilter(filter: FilterState): boolean {
  return (
    filter.query === null &&
    filter.tags.length === 0 &&
    filter.priority === null &&
    filter.status === null &&
    filter.due === null
  );
}

export function updateFilterState(
  current: FilterState,
  updates: Partial<FilterState>
): FilterState {
  return createFilterState({
    ...current,
    ...updates,
  });
}
