"use client";

import { FormEvent, useState, useEffect } from "react";
import { Alert, Button, Card, Checkbox } from "@/components/atoms";
import { FormField, TextareaField } from "@/components/molecules";
import Link from "next/link";

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialPublished?: boolean;
  onSubmit: (title: string, content: string, published?: boolean) => void;
  isLoading: boolean;
  error: string;
  submitButtonText: string;
  cancelHref: string;
}

export const PostForm = ({
  initialTitle = "",
  initialContent = "",
  initialPublished = false,
  onSubmit,
  isLoading,
  error,
  submitButtonText,
  cancelHref,
}: PostFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [published, setPublished] = useState(initialPublished);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setPublished(initialPublished);
  }, [initialTitle, initialContent, initialPublished]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(title, content, published);
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
          label="Title"
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextareaField
          label="Content"
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
        />

        <div className="mb-4">
          <Checkbox
            label="Published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
        </div>

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
