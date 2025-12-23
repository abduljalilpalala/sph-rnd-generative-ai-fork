"use client";

import { useCreatePost } from "@/hooks/useCreatePost";
import { PostForm } from "@/components/organisms";
import { PageHeader } from "@/components/templates";

const CreatePostPage = () => {
  const { handleCreate, isLoading, error } = useCreatePost();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Create Post"
          actions={[
            { href: "/posts", label: "Back to Posts", variant: "secondary" },
          ]}
        />
        <PostForm
          onSubmit={handleCreate}
          isLoading={isLoading}
          error={error}
          submitButtonText="Create Post"
          cancelHref="/posts"
        />
      </div>
    </main>
  );
};

export default CreatePostPage;
