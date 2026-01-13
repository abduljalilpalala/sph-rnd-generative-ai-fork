import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/atoms";
import { TaskCard } from "@/components/molecules/TaskCard";
import { Task, TaskStatus } from "@/lib/services/taskApi";

interface ColumnProps {
  columnId: string;
  title: string;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onAssign?: (taskId: number) => void;
}

const getColumnColor = (columnId: string): string => {
  switch (columnId) {
    case TaskStatus.OPEN:
      return "bg-blue-50 border-blue-200";
    case TaskStatus.IN_PROGRESS:
      return "bg-yellow-50 border-yellow-200";
    case TaskStatus.FOR_REVIEW:
      return "bg-purple-50 border-purple-200";
    case TaskStatus.CLOSED:
      return "bg-gray-50 border-gray-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getColumnHeaderColor = (columnId: string): string => {
  switch (columnId) {
    case TaskStatus.OPEN:
      return "text-blue-700 bg-blue-100";
    case TaskStatus.IN_PROGRESS:
      return "text-yellow-700 bg-yellow-100";
    case TaskStatus.FOR_REVIEW:
      return "text-purple-700 bg-purple-100";
    case TaskStatus.CLOSED:
      return "text-gray-700 bg-gray-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

export const Column = ({ columnId, title, tasks, onEdit, onDelete, onAssign }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  const taskIds = tasks.map((task) => task.id.toString());

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <Card className={`border-2 ${getColumnColor(columnId)} h-full flex flex-col`}>
        {/* Column Header */}
        <div className={`px-4 py-3 rounded-t-lg ${getColumnHeaderColor(columnId)}`}>
          <h3 className="font-semibold text-sm uppercase tracking-wide flex items-center justify-between">
            <span>{title}</span>
            <span className="bg-white bg-opacity-60 rounded-full px-2 py-0.5 text-xs font-bold">
              {tasks.length}
            </span>
          </h3>
        </div>

        {/* Droppable Area */}
        <div
          ref={setNodeRef}
          className={`flex-1 p-3 min-h-[200px] transition-colors ${
            isOver ? "bg-blue-50" : "bg-transparent"
          }`}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Drop tasks here
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAssign={onAssign}
                />
              ))
            )}
          </SortableContext>
        </div>
      </Card>
    </div>
  );
};
