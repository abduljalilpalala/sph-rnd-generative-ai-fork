import { Card, Button } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import { Task, TaskStatus } from "@/lib/services/taskApi";

interface TaskListProps {
  tasks: Task[] | undefined;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onAssign?: (taskId: number) => void;
  currentUserId: number;
}

const getStatusBadgeColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return "bg-gray-100 text-gray-800";
    case TaskStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800";
    case TaskStatus.DONE:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: TaskStatus) => {
  return status.replace(/_/g, " ");
};

export const TaskList = ({ tasks, onEdit, onDelete, onAssign, currentUserId }: TaskListProps) => {
  if (!tasks || tasks.length === 0) {
    return <EmptyState message="No tasks found. Create your first task!" />;
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {task.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {task.description || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      task.status
                    )}`}
                  >
                    {formatStatus(task.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {task.createdBy.name || task.createdBy.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {task.assignments.length > 0
                      ? task.assignments
                          .map((a) => a.user.name || a.user.email)
                          .join(", ")
                      : "Unassigned"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      Edit
                    </Button>
                  )}
                  {onAssign && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAssign(task.id)}
                    >
                      Assign
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(task.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
