<script lang="ts">
  import { ViewType } from "@todo-example/front";
  import { viewState, setView } from "../stores/todoStore";

  $: currentView = $viewState.view;
</script>

<nav class="view-selector">
  <button
    class="view-btn"
    class:active={currentView === ViewType.INBOX}
    on:click={() => setView(ViewType.INBOX)}
  >
    Inbox
  </button>
  <button
    class="view-btn"
    class:active={currentView === ViewType.PROJECT}
    on:click={() => setView(ViewType.PROJECT)}
  >
    Project
  </button>
  <button
    class="view-btn"
    class:active={currentView === ViewType.TRASH}
    on:click={() => setView(ViewType.TRASH)}
  >
    Trash
  </button>
</nav>

<style>
  .view-selector {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .view-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .view-btn.active {
    background: white;
    color: #4a90d9;
    font-weight: 500;
  }
</style>
