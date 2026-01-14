import { useMemo } from "react";
import { useTodoStore } from "../stores/useTodoStore";
import TaskSection from "./TaskSection";
import "./TaskList.css";

export default function TaskList(): JSX.Element {
  const { taskListView } = useTodoStore();

  const isEmpty = useMemo(() => {
    return (
      taskListView.withDue.tasks.length === 0 &&
      taskListView.withoutDue.tasks.length === 0
    );
  }, [taskListView]);

  if (isEmpty) {
    return (
      <div className="task-list">
        <div className="empty-state">
          <p>No tasks found</p>
          <p className="hint">Add a new task or adjust your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {taskListView.withDue.tasks.length > 0 && (
        <TaskSection section={taskListView.withDue} title="Due Date" />
      )}
      {taskListView.withoutDue.tasks.length > 0 && (
        <TaskSection section={taskListView.withoutDue} title="No Due Date" />
      )}
    </div>
  );
}
