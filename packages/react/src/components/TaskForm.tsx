import { useState } from "react";
import { useTodoStore } from "../stores/useTodoStore";
import "./TaskForm.css";

export default function TaskForm(): JSX.Element {
  const { addTask } = useTodoStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  function handleSubmit() {
    if (!title.trim()) {
      return;
    }

    const due = dueAt ? new Date(dueAt) : null;
    addTask(title.trim(), description.trim(), due);

    setTitle("");
    setDescription("");
    setDueAt("");
    setIsExpanded(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey && !isExpanded) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function expand() {
    setIsExpanded(true);
  }

  function collapse() {
    if (!title && !description && !dueAt) {
      setIsExpanded(false);
    }
  }

  return (
    <div className={`task-form${isExpanded ? " expanded" : ""}`}>
      <div className="input-row">
        <input
          value={title}
          type="text"
          className="title-input"
          placeholder="Add a new task..."
          onFocus={expand}
          onBlur={collapse}
          onKeyDown={handleKeyDown}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button
          className="add-btn"
          disabled={!title.trim()}
          onClick={handleSubmit}
        >
          Add
        </button>
      </div>

      {isExpanded && (
        <div className="expanded-fields">
          <textarea
            value={description}
            className="description-input"
            placeholder="Description (optional)"
            rows={2}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="form-row">
            <div className="field">
              <label>Due Date</label>
              <input
                value={dueAt}
                type="date"
                className="date-input"
                onChange={(event) => setDueAt(event.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
