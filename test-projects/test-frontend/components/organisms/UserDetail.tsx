"use client";

import { User } from "@/lib/services/userApi";
import { Card } from "@/components/atoms";
import { DataDisplay } from "@/components/molecules";

interface UserDetailProps {
  user: User;
}

export const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <Card className="p-6">
      <div className="grid gap-4">
        <DataDisplay label="ID" value={user.id} />
        <DataDisplay label="Email" value={user.email} />
        <DataDisplay label="Name" value={user.name || "-"} />
        <DataDisplay label="Created At" value={new Date(user.createdAt).toLocaleString()} />
        <DataDisplay label="Updated At" value={new Date(user.updatedAt).toLocaleString()} />
      </div>
    </Card>
  );
};
