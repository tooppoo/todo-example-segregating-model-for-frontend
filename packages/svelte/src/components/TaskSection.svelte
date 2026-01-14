<script lang="ts">
  import type { TaskSection as TaskSectionModel } from "@todo-example/front";
  import { createDragContext, createDropTarget } from "@todo-example/front";
  import { dragDropEnabled, handleDragDrop } from "../stores/todoStore";
  import TaskItem from "./TaskItem.svelte";

  export let section: TaskSectionModel;
  export let title: string;

  let draggedIndex: number | null = null;
  let dropTargetIndex: number | null = null;

  function onDragStart(index: number, event: DragEvent) {
    if (!$dragDropEnabled) {
      return;
    }
    draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
  }

  function onDragOver(index: number, event: DragEvent) {
    if (!$dragDropEnabled || draggedIndex === null) {
      return;
    }
    event.preventDefault();
    dropTargetIndex = index;
  }

  function onDragLeave() {
    dropTargetIndex = null;
  }

  function onDrop(index: number, event: DragEvent) {
    if (!$dragDropEnabled || draggedIndex === null) {
      return;
    }
    event.preventDefault();

    const task = section.tasks[draggedIndex];
    if (!task) {
      return;
    }

    const drag = createDragContext(draggedIndex, section.type, task);
    const drop = createDropTarget(index, section.type);

    handleDragDrop(drag, drop);

    draggedIndex = null;
    dropTargetIndex = null;
  }

  function onDragEnd() {
    draggedIndex = null;
    dropTargetIndex = null;
  }
</script>

<div class="task-section">
  <h2 class="section-title">{title}</h2>
  <ul class="task-items">
    {#each section.tasks as task, index (task.id)}
      <li
        class="task-item-wrapper"
        class:dragging={draggedIndex === index}
        class:drop-target={dropTargetIndex === index}
        class:drag-enabled={$dragDropEnabled}
        draggable={$dragDropEnabled}
        on:dragstart={(event) => onDragStart(index, event)}
        on:dragover={(event) => onDragOver(index, event)}
        on:dragleave={onDragLeave}
        on:drop={(event) => onDrop(index, event)}
        on:dragend={onDragEnd}
      >
        <TaskItem {task} />
      </li>
    {/each}
  </ul>
</div>

<style>
  .task-section {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .task-items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-item-wrapper {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  .task-item-wrapper.drag-enabled {
    cursor: grab;
  }

  .task-item-wrapper.drag-enabled:active {
    cursor: grabbing;
  }

  .task-item-wrapper.dragging {
    opacity: 0.5;
    transform: scale(1.02);
  }

  .task-item-wrapper.drop-target {
    transform: translateY(4px);
  }

  .task-item-wrapper.drop-target::before {
    content: "";
    position: absolute;
    top: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: #4a90d9;
    border-radius: 1px;
  }
</style>
