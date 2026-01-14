import { useEffect, useMemo, useState } from "react";
import {
  Priority,
  SortType,
  StatusFilter,
  createDueFilter,
} from "@todo-example/front";
import { useTodoStore } from "../stores/useTodoStore";
import "./FilterBar.css";

export default function FilterBar(): JSX.Element {
  const { viewState, setViewState, setSort } = useTodoStore();

  const [searchQuery, setSearchQuery] = useState(
    viewState.filter.query ?? ""
  );
  const [selectedPriority, setSelectedPriority] = useState<Priority | "">(
    viewState.filter.priority ?? ""
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter | "">(
    viewState.filter.status ?? ""
  );
  const [selectedSort, setSelectedSort] = useState<SortType>(viewState.sort);
  const [dueDate, setDueDate] = useState<string>("");
  const [dueType, setDueType] = useState<"exact" | "until">("exact");

  useEffect(() => {
    setSearchQuery(viewState.filter.query ?? "");
    setSelectedPriority(viewState.filter.priority ?? "");
    setSelectedStatus(viewState.filter.status ?? "");
    setSelectedSort(viewState.sort);
    if (viewState.filter.due) {
      setDueDate(viewState.filter.due.date.toISOString().split("T")[0] ?? "");
      setDueType(viewState.filter.due.type);
    } else {
      setDueDate("");
    }
  }, [viewState]);

  const hasActiveFilters = useMemo(() => {
    const filter = viewState.filter;
    return (
      filter.query !== null ||
      filter.priority !== null ||
      filter.status !== null ||
      filter.due !== null ||
      filter.tags.length > 0
    );
  }, [viewState.filter]);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setViewState({
      filter: { query: value || null },
    });
  }

  function handlePriorityChange(value: string) {
    const nextPriority = (value || "") as Priority | "";
    setSelectedPriority(nextPriority);
    setViewState({
      filter: { priority: nextPriority || null },
    });
  }

  function handleStatusChange(value: string) {
    const nextStatus = (value || "") as StatusFilter | "";
    setSelectedStatus(nextStatus);
    setViewState({
      filter: { status: nextStatus || null },
    });
  }

  function handleSortChange(value: string) {
    const nextSort = value as SortType;
    setSelectedSort(nextSort);
    setSort(nextSort);
  }

  function handleDueTypeChange(value: string) {
    const nextType = value as "exact" | "until";
    setDueType(nextType);
    if (dueDate) {
      const due = createDueFilter(nextType, new Date(dueDate));
      setViewState({
        filter: { due },
      });
    } else {
      setViewState({
        filter: { due: null },
      });
    }
  }

  function handleDueDateChange(value: string) {
    setDueDate(value);
    if (value) {
      const due = createDueFilter(dueType, new Date(value));
      setViewState({
        filter: { due },
      });
    } else {
      setViewState({
        filter: { due: null },
      });
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedPriority("");
    setSelectedStatus("");
    setDueDate("");
    setViewState({
      filter: {
        query: null,
        priority: null,
        status: null,
        due: null,
        tags: [],
      },
    });
  }

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3>Search</h3>
        <input
          value={searchQuery}
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select
          value={selectedSort}
          className="select-input"
          onChange={(event) => handleSortChange(event.target.value)}
        >
          <option value={SortType.MANUAL}>Manual</option>
          <option value={SortType.CREATED_AT}>Created Date</option>
          <option value={SortType.DUE_AT}>Due Date</option>
          <option value={SortType.PRIORITY}>Priority</option>
        </select>
      </div>

      <div className="filter-section">
        <h3>Priority</h3>
        <select
          value={selectedPriority}
          className="select-input"
          onChange={(event) => handlePriorityChange(event.target.value)}
        >
          <option value="">All</option>
          <option value={Priority.HIGH}>High</option>
          <option value={Priority.MEDIUM}>Medium</option>
          <option value={Priority.LOW}>Low</option>
          <option value={Priority.NONE}>None</option>
        </select>
      </div>

      <div className="filter-section">
        <h3>Status</h3>
        <select
          value={selectedStatus}
          className="select-input"
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="">All</option>
          <option value={StatusFilter.ACTIVE}>Active</option>
          <option value={StatusFilter.COMPLETED}>Completed</option>
        </select>
      </div>

      <div className="filter-section">
        <h3>Due Date</h3>
        <div className="due-filter">
          <select
            value={dueType}
            className="select-input small"
            onChange={(event) => handleDueTypeChange(event.target.value)}
          >
            <option value="exact">Exact</option>
            <option value="until">Until</option>
          </select>
          <input
            value={dueDate}
            type="date"
            className="date-input"
            onChange={(event) => handleDueDateChange(event.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
