import { Card } from "@/components/atoms";
import { DataDisplay } from "@/components/molecules";
import { Post } from "@/lib/services/postApi";

interface PostDetailProps {
  post: Post;
}

export const PostDetail = ({ post }: PostDetailProps) => {
  return (
    <Card className="p-6">
      <div className="grid gap-4">
        <DataDisplay label="ID" value={post.id} />
        <DataDisplay label="Title" value={post.title} />
        <DataDisplay
          label="Content"
          value={
            <div className="whitespace-pre-wrap">
              {post.content || "-"}
            </div>
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
