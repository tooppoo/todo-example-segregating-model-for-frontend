import { ViewType } from "@todo-example/front";
import { useTodoStore } from "../stores/useTodoStore";
import "./ViewSelector.css";

export default function ViewSelector(): JSX.Element {
  const { viewState, setView } = useTodoStore();
  const currentView = viewState.view;

  return (
    <nav className="view-selector">
      <button
        className={`view-btn${currentView === ViewType.INBOX ? " active" : ""}`}
        onClick={() => setView(ViewType.INBOX)}
      >
        Inbox
      </button>
      <button
        className={`view-btn${currentView === ViewType.PROJECT ? " active" : ""}`}
        onClick={() => setView(ViewType.PROJECT)}
      >
        Project
      </button>
      <button
        className={`view-btn${currentView === ViewType.TRASH ? " active" : ""}`}
        onClick={() => setView(ViewType.TRASH)}
      >
        Trash
      </button>
    </nav>
  );
}
