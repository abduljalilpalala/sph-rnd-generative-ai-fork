import { Card, Button } from "@/components/atoms";
import { EmptyState, TableHeader, TableRow } from "@/components/molecules";
import { Link } from "@/components/atoms";
import { Post } from "@/lib/services/postApi";

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
        <TableHeader
          columns={["ID", "Title", "Content", "Created At", "Actions"]}
        />
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <TableRow
              key={post.id}
              cells={[
                post.id,
                post.title,
                post.content
                  ? post.content.substring(0, 50) +
                    (post.content.length > 50 ? "..." : "")
                  : "-",
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
