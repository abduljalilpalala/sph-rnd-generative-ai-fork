"use client";

import { FormEvent, useState, useEffect } from "react";
import { Alert, Button, Card } from "@/components/atoms";
import { FormField, TextareaField } from "@/components/molecules";
import Link from "next/link";

interface RoleFormProps {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description?: string) => void;
  isLoading: boolean;
  error: string;
  submitButtonText: string;
  cancelHref: string;
}

export const RoleForm = ({
  initialName = "",
  initialDescription = "",
  onSubmit,
  isLoading,
  error,
  submitButtonText,
  cancelHref,
}: RoleFormProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(name, description);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <FormField
          label="Name"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextareaField
          label="Description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <div className="flex gap-4">
          <Button type="submit" variant="success" isLoading={isLoading} className="flex-1">
            {submitButtonText}
          </Button>
          <Link
            href={cancelHref}
            className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
};
