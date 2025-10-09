"use client";

import { FormEvent, useState, useEffect } from "react";
import { Alert, Button, Card } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import Link from "next/link";

interface UserFormProps {
  initialEmail?: string;
  initialName?: string;
  onSubmit: (email: string, name?: string) => void;
  isLoading: boolean;
  error: string;
  submitButtonText: string;
  cancelHref: string;
}

export const UserForm = ({
  initialEmail = "",
  initialName = "",
  onSubmit,
  isLoading,
  error,
  submitButtonText,
  cancelHref,
}: UserFormProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setEmail(initialEmail);
    setName(initialName);
  }, [initialEmail, initialName]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email, name);
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
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label="Name"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
