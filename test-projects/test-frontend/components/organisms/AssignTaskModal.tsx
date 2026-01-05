import { useState, FormEvent } from "react";
import { Modal } from "@/components/molecules/Modal";
import { Button, Input, Label } from "@/components/atoms";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number) => Promise<void>;
  isLoading?: boolean;
}

export const AssignTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AssignTaskModalProps) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const userIdNum = parseInt(userId);
    if (!userId || isNaN(userIdNum)) {
      setError("Valid user ID is required");
      return;
    }

    try {
      await onSubmit(userIdNum);
      onClose();
      setUserId("");
    } catch (err) {
      setError("Failed to assign task. Please try again.");
    }
  };

  const handleClose = () => {
    setUserId("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Task"
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
            {isLoading ? "Assigning..." : "Assign"}
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
          <Label htmlFor="userId" required>
            User ID
          </Label>
          <Input
            id="userId"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID to assign"
            required
          />
        </div>
      </form>
    </Modal>
  );
};
