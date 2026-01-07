import { Draggable } from "react-beautiful-dnd";
import { Button, Badge } from "@/components/atoms";
import { Task, TaskStatus } from "@/lib/services/taskApi";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onAssign?: (taskId: number) => void;
}

const getStatusBadgeVariant = (status: TaskStatus): "success" | "info" | "warning" | "danger" => {
  switch (status) {
    case TaskStatus.OPEN:
      return "info";
    case TaskStatus.IN_PROGRESS:
      return "warning";
    case TaskStatus.FOR_REVIEW:
      return "success";
    case TaskStatus.CLOSED:
      return "danger";
    default:
      return "info";
  }
};

const formatStatus = (status: TaskStatus): string => {
  return status.replace(/_/g, " ");
};

export const TaskCard = ({ task, index, onEdit, onDelete, onAssign }: TaskCardProps) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""
          }`}
        >
          {/* Task Header */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2">{task.title}</h4>
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {formatStatus(task.status)}
            </Badge>
          </div>

          {/* Task Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Task Meta */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{task.createdBy.name || task.createdBy.email}</span>
            </div>

            {task.assignments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="truncate">
                  {task.assignments.map((a) => a.user.name || a.user.email).join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Task Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
            {onAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAssign(task.id)}
                className="flex-1"
              >
                Assign
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
