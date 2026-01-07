import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "@/components/molecules/Column";
import { TaskCard } from "@/components/molecules/TaskCard";
import { Task, TaskStatus } from "@/lib/services/taskApi";

interface TaskBoardProps {
  tasks: Task[] | undefined;
  projectId: number;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onAssign?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
  onReorder?: (taskOrders: { taskId: number; order: number }[]) => void;
}

interface BoardData {
  columns: {
    [key: string]: {
      id: string;
      title: string;
      taskIds: string[];
    };
  };
  tasks: {
    [key: string]: Task;
  };
}

const initializeBoardData = (tasks: Task[] | undefined): BoardData => {
  const columns = {
    [TaskStatus.OPEN]: {
      id: TaskStatus.OPEN,
      title: "Open",
      taskIds: [] as string[],
    },
    [TaskStatus.IN_PROGRESS]: {
      id: TaskStatus.IN_PROGRESS,
      title: "In-Progress",
      taskIds: [] as string[],
    },
    [TaskStatus.FOR_REVIEW]: {
      id: TaskStatus.FOR_REVIEW,
      title: "For Review",
      taskIds: [] as string[],
    },
    [TaskStatus.CLOSED]: {
      id: TaskStatus.CLOSED,
      title: "Closed",
      taskIds: [] as string[],
    },
  };

  const tasksMap: { [key: string]: Task } = {};

  if (tasks) {
    // Sort tasks by order field first
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

    sortedTasks.forEach((task) => {
      const taskIdStr = task.id.toString();
      tasksMap[taskIdStr] = task;
      columns[task.status].taskIds.push(taskIdStr);
    });
  }

  return { columns, tasks: tasksMap };
};

export const TaskBoard = ({
  tasks,
  projectId,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
  onReorder,
}: TaskBoardProps) => {
  const [boardData, setBoardData] = useState<BoardData>(initializeBoardData(tasks));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update board data when tasks prop changes
  useEffect(() => {
    setBoardData(initializeBoardData(tasks));
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id.toString();
    const task = boardData.tasks[taskId];
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find source column
    let sourceColumnId: string | null = null;
    for (const [columnId, column] of Object.entries(boardData.columns)) {
      if (column.taskIds.includes(activeId)) {
        sourceColumnId = columnId;
        break;
      }
    }

    if (!sourceColumnId) {
      return;
    }

    // Determine destination column and index
    let destinationColumnId: string;
    let destinationIndex: number;

    // Check if dropped over a column container
    if (Object.keys(boardData.columns).includes(overId)) {
      destinationColumnId = overId;
      destinationIndex = boardData.columns[overId].taskIds.length;
    } else {
      // Dropped over a task, find its column
      let foundColumn: string | null = null;
      let foundIndex: number = -1;

      for (const [columnId, column] of Object.entries(boardData.columns)) {
        const taskIndex = column.taskIds.indexOf(overId);
        if (taskIndex !== -1) {
          foundColumn = columnId;
          foundIndex = taskIndex;
          break;
        }
      }

      if (!foundColumn || foundIndex === -1) {
        return;
      }

      destinationColumnId = foundColumn;
      destinationIndex = foundIndex;
    }

    const taskId = parseInt(activeId);

    // Moving within the same column
    if (sourceColumnId === destinationColumnId) {
      const column = boardData.columns[sourceColumnId];
      const oldIndex = column.taskIds.indexOf(activeId);

      if (oldIndex === destinationIndex) {
        return;
      }

      const newTaskIds = [...column.taskIds];
      newTaskIds.splice(oldIndex, 1);
      newTaskIds.splice(destinationIndex, 0, activeId);

      const newColumn = {
        ...column,
        taskIds: newTaskIds,
      };

      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn,
        },
      };

      setBoardData(newBoardData);

      // Calculate new order values for all tasks in the column
      const taskOrders = newTaskIds.map((id, index) => ({
        taskId: parseInt(id),
        order: index,
      }));

      // Persist the reordering
      if (onReorder) {
        onReorder(taskOrders);
      }
    } else {
      // Moving to a different column
      const sourceColumn = boardData.columns[sourceColumnId];
      const destinationColumn = boardData.columns[destinationColumnId];

      const sourceTaskIds = [...sourceColumn.taskIds];
      const sourceIndex = sourceTaskIds.indexOf(activeId);
      sourceTaskIds.splice(sourceIndex, 1);

      const destinationTaskIds = [...destinationColumn.taskIds];
      destinationTaskIds.splice(destinationIndex, 0, activeId);

      const newSourceColumn = {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      };

      const newDestinationColumn = {
        ...destinationColumn,
        taskIds: destinationTaskIds,
      };

      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newSourceColumn.id]: newSourceColumn,
          [newDestinationColumn.id]: newDestinationColumn,
        },
      };

      setBoardData(newBoardData);

      // Notify parent component about status change
      if (onStatusChange) {
        onStatusChange(taskId, destinationColumnId as TaskStatus);
      }

      // Calculate new order values for tasks in both columns
      const sourceTaskOrders = sourceTaskIds.map((id, index) => ({
        taskId: parseInt(id),
        order: index,
      }));

      const destinationTaskOrders = destinationTaskIds.map((id, index) => ({
        taskId: parseInt(id),
        order: index,
      }));

      // Persist the reordering for both columns
      if (onReorder) {
        onReorder([...sourceTaskOrders, ...destinationTaskOrders]);
      }
    }
  };

  const columnOrder = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.FOR_REVIEW,
    TaskStatus.CLOSED,
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnOrder.map((columnId) => {
          const column = boardData.columns[columnId];
          const columnTasks = column.taskIds
            .map((taskId) => boardData.tasks[taskId])
            .filter(Boolean);

          return (
            <Column
              key={column.id}
              columnId={column.id}
              title={column.title}
              tasks={columnTasks}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssign={onAssign}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing">
            <TaskCard
              task={activeTask}
              index={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssign={onAssign}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
