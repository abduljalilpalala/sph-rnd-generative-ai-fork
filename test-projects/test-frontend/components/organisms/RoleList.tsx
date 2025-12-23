"use client";

import { Role } from "@/lib/services/roleApi";
import { Card, Link, Button } from "@/components/atoms";
import { EmptyState, TableHeader, TableRow } from "@/components/molecules";

interface RoleListProps {
  roles: Role[] | undefined;
  onDelete: (id: number) => void;
}

export const RoleList = ({ roles, onDelete }: RoleListProps) => {
  if (!roles || roles.length === 0) {
    return <EmptyState message="No roles found. Create one to get started!" />;
  }

  return (
    <Card className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader columns={["ID", "Name", "Description", "Created At", "Actions"]} />
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <TableRow
              key={role.id}
              cells={[
                role.id,
                role.name,
                role.description || "-",
                new Date(role.createdAt).toLocaleDateString(),
                <div key="actions" className="flex gap-4">
                  <Link href={`/roles/${role.id}`} variant="primary">
                    View
                  </Link>
                  <Link href={`/roles/${role.id}/edit`} variant="success">
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(role.id)}
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
