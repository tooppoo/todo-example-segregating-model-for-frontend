<script lang="ts">
  import { taskListView } from "../stores/todoStore";
  import TaskSection from "./TaskSection.svelte";

  $: isEmpty =
    $taskListView.withDue.tasks.length === 0 &&
    $taskListView.withoutDue.tasks.length === 0;
</script>

<div class="task-list">
  {#if isEmpty}
    <div class="empty-state">
      <p>No tasks found</p>
      <p class="hint">Add a new task or adjust your filters</p>
    </div>
  {:else}
    {#if $taskListView.withDue.tasks.length > 0}
      <TaskSection section={$taskListView.withDue} title="Due Date" />
    {/if}
    {#if $taskListView.withoutDue.tasks.length > 0}
      <TaskSection section={$taskListView.withoutDue} title="No Due Date" />
    {/if}
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background: white;
    border-radius: 8px;
    color: #666;
  }

  .empty-state .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    color: #999;
  }
</style>
