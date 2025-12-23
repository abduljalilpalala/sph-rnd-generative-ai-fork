"use client";

import { useState } from "react";
import { Sidebar, TopNavigation } from "@/components/organisms";
import { Icon, Badge } from "@/components/atoms";

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  status: "published" | "draft" | "archived";
  publishedDate: string;
  views: number;
}

const PostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data
  const posts: Post[] = [
    {
      id: 1,
      title: "Getting Started with Next.js 15",
      author: "John Doe",
      category: "Technology",
      status: "published",
      publishedDate: "2024-01-15",
      views: 1234,
    },
    {
      id: 2,
      title: "Best Practices for React Development",
      author: "Jane Smith",
      category: "Development",
      status: "published",
      publishedDate: "2024-01-14",
      views: 892,
    },
    {
      id: 3,
      title: "Introduction to TypeScript",
      author: "Bob Wilson",
      category: "Programming",
      status: "draft",
      publishedDate: "2024-01-13",
      views: 0,
    },
    {
      id: 4,
      title: "Tailwind CSS Tips and Tricks",
      author: "Alice Johnson",
      category: "Design",
      status: "published",
      publishedDate: "2024-01-12",
      views: 654,
    },
    {
      id: 5,
      title: "Understanding Redux Toolkit",
      author: "Charlie Brown",
      category: "Development",
      status: "archived",
      publishedDate: "2023-12-20",
      views: 2341,
    },
    {
      id: 6,
      title: "Building Responsive Layouts",
      author: "Diana Prince",
      category: "Design",
      status: "published",
      publishedDate: "2024-01-10",
      views: 445,
    },
    {
      id: 7,
      title: "API Design Best Practices",
      author: "Evan Davis",
      category: "Backend",
      status: "draft",
      publishedDate: "2024-01-09",
      views: 0,
    },
    {
      id: 8,
      title: "Testing React Components",
      author: "Fiona Green",
      category: "Testing",
      status: "published",
      publishedDate: "2024-01-08",
      views: 789,
    },
  ];

  const getStatusColor = (status: Post["status"]) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "yellow";
      case "archived":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Post Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Post Management</h1>
              <p className="text-gray-600">Create, edit, and manage all posts</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Published</p>
                <p className="text-2xl font-bold text-gray-800">
                  {posts.filter((p) => p.status === "published").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {posts.filter((p) => p.status === "draft").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
                <p className="text-sm text-gray-600 mb-1">Archived</p>
                <p className="text-2xl font-bold text-gray-800">
                  {posts.filter((p) => p.status === "archived").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-gray-800">
                  {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">All Posts</h2>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Icon name="document" size={18} />
                  Create Post
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{post.author}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{post.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={getStatusColor(post.status)}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{post.publishedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{post.views.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostsPage;
