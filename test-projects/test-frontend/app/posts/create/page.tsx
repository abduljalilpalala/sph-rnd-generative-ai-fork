"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreatePost } from "@/hooks/useCreatePost";
import { PostForm, Sidebar, TopNavigation } from "@/components/organisms";

const CreatePostPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { handleCreate, isLoading, error } = useCreatePost();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Create Post"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create Post</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new post to the system
                </p>
              </div>
              <Link
                href="/posts"
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
              >
                Back to Posts
              </Link>
            </div>

            {/* Form */}
            <PostForm
              onSubmit={handleCreate}
              isLoading={isLoading}
              error={error}
              submitButtonText="Create Post"
              cancelHref="/posts"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatePostPage;
