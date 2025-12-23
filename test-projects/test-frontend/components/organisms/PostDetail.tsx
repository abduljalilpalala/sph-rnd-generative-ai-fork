"use client";

import { Post } from "@/lib/services/postApi";
import { Card, Badge } from "@/components/atoms";
import { DataDisplay } from "@/components/molecules";

interface PostDetailProps {
  post: Post;
}

export const PostDetail = ({ post }: PostDetailProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <DataDisplay label="ID" value={post.id} />
        <DataDisplay label="Title" value={post.title} />
        <DataDisplay
          label="Content"
          value={<div className="whitespace-pre-wrap">{post.content}</div>}
        />
        <DataDisplay
          label="Status"
          value={
            <Badge variant={post.published ? "success" : "secondary"}>
              {post.published ? "Published" : "Draft"}
            </Badge>
          }
        />
        <DataDisplay
          label="Created At"
          value={new Date(post.createdAt).toLocaleString()}
        />
        <DataDisplay
          label="Updated At"
          value={new Date(post.updatedAt).toLocaleString()}
        />
      </div>
    </Card>
  );
};
