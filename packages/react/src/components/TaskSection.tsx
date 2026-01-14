import { useState } from "react";
import type { TaskSection as TaskSectionModel } from "@todo-example/front";
import { createDragContext, createDropTarget } from "@todo-example/front";
import { useTodoStore } from "../stores/useTodoStore";
import TaskItem from "./TaskItem";
import "./TaskSection.css";

interface TaskSectionProps {
  section: TaskSectionModel;
  title: string;
}

export default function TaskSection({
  section,
  title,
}: TaskSectionProps): JSX.Element {
  const { dragDropEnabled, handleDragDrop } = useTodoStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  function handleDragStart(
    index: number,
    event: React.DragEvent<HTMLLIElement>
  ) {
    if (!dragDropEnabled) {
      return;
    }
    setDraggedIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
  }

  function handleDragOver(
    index: number,
    event: React.DragEvent<HTMLLIElement>
  ) {
    if (!dragDropEnabled || draggedIndex === null) {
      return;
    }
    event.preventDefault();
    setDropTargetIndex(index);
  }

  function handleDragLeave() {
    setDropTargetIndex(null);
  }

  function handleDrop(index: number, event: React.DragEvent<HTMLLIElement>) {
    if (!dragDropEnabled || draggedIndex === null) {
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

    setDraggedIndex(null);
    setDropTargetIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }

  return (
    <div className="task-section">
      <h2 className="section-title">{title}</h2>
      <ul className="task-items">
        {section.tasks.map((task, index) => {
          const className = [
            "task-item-wrapper",
            draggedIndex === index ? "dragging" : "",
            dropTargetIndex === index ? "drop-target" : "",
            dragDropEnabled ? "drag-enabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={task.id}
              className={className}
              draggable={dragDropEnabled}
              onDragStart={(event) => handleDragStart(index, event)}
              onDragOver={(event) => handleDragOver(index, event)}
              onDragLeave={handleDragLeave}
              onDrop={(event) => handleDrop(index, event)}
              onDragEnd={handleDragEnd}
            >
              <TaskItem task={task} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
