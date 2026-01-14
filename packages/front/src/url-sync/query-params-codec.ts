import { isPriority } from "../domain/priority.js";
import {
  type ViewState,
  createViewState,
  createFilterState,
  isViewType,
  isSortType,
  isStatusFilter,
  parseDueFilter,
  formatDueFilter,
  ViewType,
  SortType,
} from "../view-state/index.js";
import { type QueryParams, createQueryParams, parseFromRecord, toRecord } from "./query-params.js";

export function encodeViewState(state: ViewState): QueryParams {
  const { filter } = state;

  return createQueryParams({
    q: filter.query,
    tags: filter.tags.length > 0 ? filter.tags.join(",") : null,
    priority: filter.priority,
    status: filter.status,
    view: state.view !== ViewType.INBOX ? state.view : null,
    sort: state.sort !== SortType.MANUAL ? state.sort : null,
    due: filter.due ? formatDueFilter(filter.due) : null,
  });
}

export function decodeQueryParams(params: QueryParams): ViewState {
  const tags = params.tags
    ? params.tags.split(",").filter((t) => t.length > 0)
    : [];

  const priority = isPriority(params.priority) ? params.priority : null;
  const status = isStatusFilter(params.status) ? params.status : null;
  const due = params.due ? parseDueFilter(params.due) : null;

  const view = isViewType(params.view) ? params.view : ViewType.INBOX;
  const sort = isSortType(params.sort) ? params.sort : SortType.MANUAL;

  return createViewState({
    view,
    sort,
    filter: createFilterState({
      query: params.q,
      tags,
      priority,
      status,
      due,
    }),
  });
}

/**
 * Encode ViewState to a record (for framework router)
 */
export function encodeToRecord(state: ViewState): Record<string, string> {
  return toRecord(encodeViewState(state));
}

/**
 * Decode ViewState from a record (from framework router)
 */
export function decodeFromRecord(
  record: Record<string, string | undefined>
): ViewState {
  return decodeQueryParams(parseFromRecord(record));
}
