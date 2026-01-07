import { useState, useEffect, FormEvent } from "react";
import { Modal } from "@/components/molecules/Modal";
import { Button, Input, Label } from "@/components/atoms";
import { Task, TaskStatus } from "@/lib/services/taskApi";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; status?: TaskStatus }) => Promise<void>;
  task?: Task;
  isLoading?: boolean;
}

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
}: TaskFormModalProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO);
  const [error, setError] = useState<string | null>(null);

  // Update form fields when task prop changes (for edit mode)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
    } else {
      // Reset to empty when creating new task
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.TODO);
    }
  }, [task]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      await onSubmit({ title, description: description || undefined, status });
      onClose();
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.TODO);
    } catch (err) {
      setError("Failed to save task. Please try again.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStatus(TaskStatus.TODO);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? "Edit Task" : "Create Task"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : task ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="title" required>
            Task Title
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="status" required>
            Status
          </Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
