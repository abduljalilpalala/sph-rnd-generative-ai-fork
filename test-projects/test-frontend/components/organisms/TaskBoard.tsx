import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Column } from "@/components/molecules/Column";
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

  // Update board data when tasks prop changes
  useEffect(() => {
    setBoardData(initializeBoardData(tasks));
  }, [tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = boardData.columns[source.droppableId];
    const destinationColumn = boardData.columns[destination.droppableId];
    const taskIdStr = draggableId; // Already a string from Draggable
    const taskId = parseInt(draggableId); // Convert to number for API calls

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, taskIdStr);

      const newColumn = {
        ...sourceColumn,
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
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);
      const newSourceColumn = {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      };

      const destinationTaskIds = Array.from(destinationColumn.taskIds);
      destinationTaskIds.splice(destination.index, 0, taskIdStr);
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
        onStatusChange(taskId, destination.droppableId as TaskStatus);
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
    <DragDropContext onDragEnd={handleDragEnd}>
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
    </DragDropContext>
  );
};
