<script lang="ts">
  import {
    Priority,
    SortType,
    StatusFilter,
    createDueFilter,
  } from "@todo-example/front";
  import { viewState, setViewState, setSort } from "../stores/todoStore";

  let searchQuery = "";
  let selectedPriority: Priority | "" = "";
  let selectedStatus: StatusFilter | "" = "";
  let selectedSort: SortType = SortType.MANUAL;
  let dueDate = "";
  let dueType: "exact" | "until" = "exact";

  $: {
    const state = $viewState;
    searchQuery = state.filter.query ?? "";
    selectedPriority = state.filter.priority ?? "";
    selectedStatus = state.filter.status ?? "";
    selectedSort = state.sort;
    if (state.filter.due) {
      dueDate = state.filter.due.date.toISOString().split("T")[0] ?? "";
      dueType = state.filter.due.type;
    } else {
      dueDate = "";
    }
  }

  $: hasActiveFilters =
    $viewState.filter.query !== null ||
    $viewState.filter.priority !== null ||
    $viewState.filter.status !== null ||
    $viewState.filter.due !== null ||
    $viewState.filter.tags.length > 0;

  function handleSearchChange() {
    setViewState({
      filter: { query: searchQuery || null },
    });
  }

  function handlePriorityChange() {
    setViewState({
      filter: { priority: selectedPriority || null },
    });
  }

  function handleStatusChange() {
    setViewState({
      filter: { status: selectedStatus || null },
    });
  }

  function handleSortChange() {
    setSort(selectedSort);
  }

  function handleDueTypeChange() {
    if (dueDate) {
      const due = createDueFilter(dueType, new Date(dueDate));
      setViewState({
        filter: { due },
      });
    } else {
      setViewState({
        filter: { due: null },
      });
    }
  }

  function handleDueDateChange() {
    if (dueDate) {
      const due = createDueFilter(dueType, new Date(dueDate));
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
    searchQuery = "";
    selectedPriority = "";
    selectedStatus = "";
    dueDate = "";
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
</script>

<div class="filter-bar">
  <div class="filter-section">
    <h3>Search</h3>
    <input
      bind:value={searchQuery}
      type="text"
      placeholder="Search tasks..."
      class="search-input"
      on:input={handleSearchChange}
    />
  </div>

  <div class="filter-section">
    <h3>Sort By</h3>
    <select
      bind:value={selectedSort}
      class="select-input"
      on:change={handleSortChange}
    >
      <option value={SortType.MANUAL}>Manual</option>
      <option value={SortType.CREATED_AT}>Created Date</option>
      <option value={SortType.DUE_AT}>Due Date</option>
      <option value={SortType.PRIORITY}>Priority</option>
    </select>
  </div>

  <div class="filter-section">
    <h3>Priority</h3>
    <select
      bind:value={selectedPriority}
      class="select-input"
      on:change={handlePriorityChange}
    >
      <option value="">All</option>
      <option value={Priority.HIGH}>High</option>
      <option value={Priority.MEDIUM}>Medium</option>
      <option value={Priority.LOW}>Low</option>
      <option value={Priority.NONE}>None</option>
    </select>
  </div>

  <div class="filter-section">
    <h3>Status</h3>
    <select
      bind:value={selectedStatus}
      class="select-input"
      on:change={handleStatusChange}
    >
      <option value="">All</option>
      <option value={StatusFilter.ACTIVE}>Active</option>
      <option value={StatusFilter.COMPLETED}>Completed</option>
    </select>
  </div>

  <div class="filter-section">
    <h3>Due Date</h3>
    <div class="due-filter">
      <select
        bind:value={dueType}
        class="select-input small"
        on:change={handleDueTypeChange}
      >
        <option value="exact">Exact</option>
        <option value="until">Until</option>
      </select>
      <input
        bind:value={dueDate}
        type="date"
        class="date-input"
        on:change={handleDueDateChange}
      />
    </div>
  </div>

  {#if hasActiveFilters}
    <button class="clear-filters-btn" on:click={clearFilters}>
      Clear Filters
    </button>
  {/if}
</div>

<style>
  .filter-bar {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .search-input,
  .select-input,
  .date-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }

  .search-input:focus,
  .select-input:focus,
  .date-input:focus {
    outline: none;
    border-color: #4a90d9;
  }

  .due-filter {
    display: flex;
    gap: 0.5rem;
  }

  .due-filter .select-input.small {
    width: auto;
    flex-shrink: 0;
  }

  .due-filter .date-input {
    flex: 1;
  }

  .clear-filters-btn {
    width: 100%;
    padding: 0.5rem;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #666;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-filters-btn:hover {
    background: #eee;
    border-color: #ccc;
  }
</style>
