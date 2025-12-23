"use client";

import { usePost } from "@/hooks/usePost";
import { PostDetail } from "@/components/organisms";
import {
  LoadingState,
  ErrorState,
  PageHeader,
} from "@/components/templates";
import { use } from "react";

const PostDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id);
  const { post, isLoading, error } = usePost(postId);

  if (isLoading) return <LoadingState message="Loading post..." />;
  if (error || !post) return <ErrorState message="Post not found" showBackLink />;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Post Details"
          actions={[
            { href: `/posts/${post.id}/edit`, label: "Edit", variant: "success" },
            { href: "/posts", label: "Back to Posts", variant: "secondary" },
          ]}
        />
        <PostDetail post={post} />
      </div>
    </main>
  );
};

export default PostDetailPage;
