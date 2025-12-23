"use client";

import { useState, use } from "react";
import Link from "next/link";
import { usePost } from "@/hooks/usePost";
import { PostDetail, Sidebar, TopNavigation } from "@/components/organisms";

const PostDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id);
  const { post, isLoading, error } = usePost(postId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Post Details"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading post...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {(error || !post) && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Post not found</p>
                <p className="text-red-600 text-sm mt-1">The requested post does not exist</p>
                <Link
                  href="/posts"
                  className="inline-block mt-4 bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                >
                  Back to Posts
                </Link>
              </div>
            )}

            {/* Post Details */}
            {!isLoading && !error && post && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Post Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage post information
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href="/posts"
                      className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                    >
                      Back to Posts
                    </Link>
                  </div>
                </div>
                <PostDetail post={post} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostDetailPage;
