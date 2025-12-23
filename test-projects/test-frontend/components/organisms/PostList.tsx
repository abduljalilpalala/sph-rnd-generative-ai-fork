"use client";

import { Post } from "@/lib/services/postApi";
import { Card, Link, Button, Badge } from "@/components/atoms";
import { EmptyState, TableHeader, TableRow } from "@/components/molecules";

interface PostListProps {
  posts: Post[] | undefined;
  onDelete: (id: number) => void;
}

export const PostList = ({ posts, onDelete }: PostListProps) => {
  if (!posts || posts.length === 0) {
    return <EmptyState message="No posts found. Create one to get started!" />;
  }

  return (
    <Card className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader columns={["ID", "Title", "Published", "Created At", "Actions"]} />
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <TableRow
              key={post.id}
              cells={[
                post.id,
                post.title,
                <Badge key="published" variant={post.published ? "success" : "secondary"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>,
                new Date(post.createdAt).toLocaleDateString(),
                <div key="actions" className="flex gap-4">
                  <Link href={`/posts/${post.id}`} variant="primary">
                    View
                  </Link>
                  <Link href={`/posts/${post.id}/edit`} variant="success">
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(post.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-transparent p-0"
                  >
                    Delete
                  </Button>
                </div>,
              ]}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
};
