"use client";

import { Role } from "@/lib/services/roleApi";
import { Card } from "@/components/atoms";
import { DataDisplay } from "@/components/molecules";

interface RoleDetailProps {
  role: Role;
}

export const RoleDetail = ({ role }: RoleDetailProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <DataDisplay label="ID" value={role.id} />
        <DataDisplay label="Name" value={role.name} />
        <DataDisplay label="Description" value={role.description || "-"} />
        <DataDisplay
          label="Created At"
          value={new Date(role.createdAt).toLocaleString()}
        />
        <DataDisplay
          label="Updated At"
          value={new Date(role.updatedAt).toLocaleString()}
        />
      </div>
    </Card>
  );
};
