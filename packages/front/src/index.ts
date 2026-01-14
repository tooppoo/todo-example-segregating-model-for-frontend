// Domain types
export {
  Priority,
  comparePriority,
  isPriority,
  type Tag,
  createTag,
} from "./domain/index.js";

// View State
export {
  ViewType,
  isViewType,
  SortType,
  isSortType,
  StatusFilter,
  isStatusFilter,
  type DueFilter,
  type DueFilterType,
  createDueFilter,
  matchesDueFilter,
  parseDueFilter,
  formatDueFilter,
  type FilterState,
  createFilterState,
  isEmptyFilter,
  updateFilterState,
  type ViewState,
  createViewState,
  isDragDropEnabled,
  updateViewState,
} from "./view-state/index.js";

// Display Model
export {
  type DisplayTask,
  createDisplayTask,
  hasDue,
  isArchived,
  updateDisplayTask,
  type TaskSection,
  type SectionType,
  createTaskSection,
  isSectionEmpty,
  getSectionTaskCount,
  type TaskListView,
  createTaskListView,
  getAllTasks,
  getVisibleTaskIds,
  getTotalTaskCount,
  isEmptyView,
} from "./display/index.js";

// URL Sync
export {
  type QueryParams,
  createQueryParams,
  parseFromRecord,
  toRecord,
  encodeViewState,
  decodeQueryParams,
  encodeToRecord,
  decodeFromRecord,
} from "./url-sync/index.js";

// List Operations
export {
  applyFilter,
  matchesFilter,
  sortTasks,
  buildTaskListView,
} from "./list-operations/index.js";

// Drag & Drop
export {
  type DragContext,
  createDragContext,
  type DropTarget,
  createDropTarget,
  type ReorderResult,
  createReorderResult,
  resolveManualOrder,
  calculateNewPositions,
} from "./drag-drop/index.js";

// Section Transfer
export {
  type SectionTransfer,
  type InsertPosition,
  createSectionTransfer,
  type DueChangeResult,
  addDue,
  removeDue,
  changeDue,
  setTaskDueInList,
} from "./section-transfer/index.js";
