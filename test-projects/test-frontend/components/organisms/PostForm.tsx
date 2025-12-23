import { useState, useEffect, FormEvent } from "react";
import { Card, Alert, Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import Link from "next/link";

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (title: string, content?: string) => void;
  isLoading: boolean;
  error: string;
  submitButtonText: string;
  cancelHref: string;
}

export const PostForm = ({
  initialTitle = "",
  initialContent = "",
  onSubmit,
  isLoading,
  error,
  submitButtonText,
  cancelHref,
}: PostFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(title, content);
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

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 font-semibold mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition"
            rows={6}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="success"
            isLoading={isLoading}
            className="flex-1"
          >
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
