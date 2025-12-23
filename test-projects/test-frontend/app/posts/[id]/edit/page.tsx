"use client";

import { usePost } from "@/hooks/usePost";
import { useUpdatePost } from "@/hooks/useUpdatePost";
import { PostForm } from "@/components/organisms";
import {
  LoadingState,
  ErrorState,
  PageHeader,
} from "@/components/templates";
import { use } from "react";

const EditPostPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id);
  const { post, isLoading: isLoadingPost } = usePost(postId);
  const { handleUpdate, isLoading, error } = useUpdatePost(postId);

  if (isLoadingPost) return <LoadingState message="Loading post..." />;
  if (!post) return <ErrorState message="Post not found" showBackLink />;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Edit Post"
          actions={[
            { href: `/posts/${postId}`, label: "Back to Post", variant: "secondary" },
          ]}
        />
        <PostForm
          initialTitle={post.title}
          initialContent={post.content || ""}
          onSubmit={handleUpdate}
          isLoading={isLoading}
          error={error}
          submitButtonText="Update Post"
          cancelHref={`/posts/${postId}`}
        />
      </div>
    </main>
  );
};

export default EditPostPage;
