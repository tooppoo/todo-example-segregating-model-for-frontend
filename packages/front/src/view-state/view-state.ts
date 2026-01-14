import {
  type FilterState,
  createFilterState,
  updateFilterState,
} from "./filter-state.js";
import { SortType } from "./sort-type.js";
import { ViewType } from "./view-type.js";

export interface ViewState {
  readonly view: ViewType;
  readonly sort: SortType;
  readonly filter: FilterState;
}

export function createViewState(params: Partial<ViewState> = {}): ViewState {
  return Object.freeze({
    view: params.view ?? ViewType.INBOX,
    sort: params.sort ?? SortType.MANUAL,
    filter: params.filter ?? createFilterState(),
  });
}

export function isDragDropEnabled(state: ViewState): boolean {
  return state.sort === SortType.MANUAL;
}

export function updateViewState(
  current: ViewState,
  updates: Partial<Omit<ViewState, "filter">> & {
    filter?: Partial<FilterState>;
  }
): ViewState {
  const { filter: filterUpdates, ...rest } = updates;
  return createViewState({
    ...current,
    ...rest,
    filter: filterUpdates
      ? updateFilterState(current.filter, filterUpdates)
      : current.filter,
  });
}
