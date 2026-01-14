import { useMemo, useState } from "react";
import type { DisplayTask } from "@todo-example/front";
import { Priority, ViewType } from "@todo-example/front";
import { useTodoStore } from "../stores/useTodoStore";
import "./TaskItem.css";

interface TaskItemProps {
  task: DisplayTask;
}

export default function TaskItem({ task }: TaskItemProps): JSX.Element {
  const {
    viewState,
    updateTask,
    deleteTask,
    restoreTask,
    completeTask,
    uncompleteTask,
    isTaskCompleted,
    setTaskDue,
    setTaskPriority,
  } = useTodoStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueAt, setEditDueAt] = useState("");

  const isCompleted = isTaskCompleted(task);
  const isTrashView = viewState.view === ViewType.TRASH;
  const priorityClass = `priority-${task.priority}`;

  const formattedDueAt = useMemo(() => {
    if (!task.dueAt) {
      return null;
    }
    return task.dueAt.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [task.dueAt]);

  function toggleComplete() {
    if (isTrashView) {
      return;
    }
    if (isCompleted) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  }

  function startEdit() {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDueAt(task.dueAt ? task.dueAt.toISOString().split("T")[0] ?? "" : "");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function saveEdit() {
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
    });

    const newDueAt = editDueAt ? new Date(editDueAt) : null;
    if (
      (newDueAt === null && task.dueAt !== null) ||
      (newDueAt !== null && task.dueAt === null) ||
      (newDueAt !== null &&
        task.dueAt !== null &&
        newDueAt.getTime() !== task.dueAt.getTime())
    ) {
      setTaskDue(task.id, newDueAt);
    }

    setIsEditing(false);
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      saveEdit();
    }
    if (event.key === "Escape") {
      cancelEdit();
    }
  }

  function handleDelete() {
    deleteTask(task.id);
  }

  function handleRestore() {
    restoreTask(task.id);
  }

  function handlePriorityChange(priority: Priority) {
    setTaskPriority(task.id, priority);
  }

  return (
    <div
      className={`task-item ${priorityClass}${isCompleted ? " completed" : ""}`}
    >
      {isEditing ? (
        <div className="edit-form">
          <input
            value={editTitle}
            type="text"
            className="edit-title"
            placeholder="Title"
            onKeyDown={handleEditKeyDown}
            onChange={(event) => setEditTitle(event.target.value)}
          />
          <textarea
            value={editDescription}
            className="edit-description"
            placeholder="Description"
            rows={2}
            onChange={(event) => setEditDescription(event.target.value)}
          />
          <input
            value={editDueAt}
            type="date"
            className="edit-due-date"
            onChange={(event) => setEditDueAt(event.target.value)}
          />
          <div className="edit-actions">
            <button className="btn btn-primary" onClick={saveEdit}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <button
            className={`checkbox${isCompleted ? " checked" : ""}`}
            onClick={toggleComplete}
            disabled={isTrashView}
          >
            {isCompleted && <span className="checkmark">&#10003;</span>}
          </button>

          <div className="task-details">
            <h3 className="task-title">{task.title}</h3>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            <div className="task-meta">
              {formattedDueAt && (
                <span className="due-date">{formattedDueAt}</span>
              )}
              {task.priority !== Priority.NONE && (
                <span className={`priority-badge ${priorityClass}`}>
                  {task.priority}
                </span>
              )}
              {task.tags.map((tag) => (
                <span key={tag.id} className="tag">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="task-actions">
            {isTrashView ? (
              <button
                className="action-btn restore"
                onClick={handleRestore}
                title="Restore"
              >
                &#8634;
              </button>
            ) : (
              <>
                <div className="priority-dropdown">
                  <button className="action-btn priority" title="Set Priority">
                    !
                  </button>
                  <div className="dropdown-content">
                    <button onClick={() => handlePriorityChange(Priority.HIGH)}>
                      High
                    </button>
                    <button onClick={() => handlePriorityChange(Priority.MEDIUM)}>
                      Medium
                    </button>
                    <button onClick={() => handlePriorityChange(Priority.LOW)}>
                      Low
                    </button>
                    <button onClick={() => handlePriorityChange(Priority.NONE)}>
                      None
                    </button>
                  </div>
                </div>
                <button
                  className="action-btn edit"
                  onClick={startEdit}
                  title="Edit"
                >
                  &#9998;
                </button>
                <button
                  className="action-btn delete"
                  onClick={handleDelete}
                  title="Delete"
                >
                  &#10005;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
