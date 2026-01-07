import { useState, FormEvent } from "react";
import { Modal } from "@/components/molecules/Modal";
import { Button, Input, Label } from "@/components/atoms";
import { ProjectRole } from "@/lib/services/projectApi";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { userId: number; role: ProjectRole }) => Promise<void>;
  isLoading?: boolean;
}

export const AddMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddMemberModalProps) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
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
      await onSubmit({ userId: userIdNum, role });
      onClose();
      setUserId("");
      setRole(ProjectRole.MEMBER);
    } catch (err) {
      setError("Failed to add member. Please try again.");
    }
  };

  const handleClose = () => {
    setUserId("");
    setRole(ProjectRole.MEMBER);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Project Member"
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
            {isLoading ? "Adding..." : "Add Member"}
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
            placeholder="Enter user ID"
            required
          />
        </div>
        <div>
          <Label htmlFor="role" required>
            Role
          </Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ProjectRole.MEMBER}>Member</option>
            <option value={ProjectRole.OWNER}>Owner</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
