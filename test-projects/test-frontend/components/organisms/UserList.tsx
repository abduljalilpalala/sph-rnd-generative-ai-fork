"use client";

import { User } from "@/lib/services/userApi";
import { Card, Link, Button } from "@/components/atoms";
import { EmptyState, TableHeader, TableRow } from "@/components/molecules";

interface UserListProps {
  users: User[] | undefined;
  onDelete: (id: number) => void;
}

export const UserList = ({ users, onDelete }: UserListProps) => {
  if (!users || users.length === 0) {
    return <EmptyState message="No users found. Create one to get started!" />;
  }

  return (
    <Card className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader columns={["ID", "Email", "Name", "Created At", "Actions"]} />
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <TableRow
              key={user.id}
              cells={[
                user.id,
                user.email,
                user.name || "-",
                new Date(user.createdAt).toLocaleDateString(),
                <div key="actions" className="flex gap-4">
                  <Link href={`/users/${user.id}`} variant="primary">
                    View
                  </Link>
                  <Link href={`/users/${user.id}/edit`} variant="success">
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-transparent p-0"
                  >
                    Delete
                  </Button>
                </div>,
              ]}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
};
