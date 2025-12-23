"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/organisms";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Pagination logic
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return posts.slice(startIndex, endIndex);
  }, [posts, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(posts.length / itemsPerPage);
  }, [posts, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

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
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Icon name="menu" size={24} className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Post Management</h1>
              </div>
              <p className="text-gray-600 ml-14">Create, edit, and manage all posts</p>
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
                    {paginatedPosts.map((post) => (
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

              {/* Pagination Controls */}
              <div className="mt-4 p-4 flex justify-between items-center border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    entries (Total: {posts.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostsPage;
