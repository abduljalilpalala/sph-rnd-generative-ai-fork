import Link from "next/link";

const Home = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Management System</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700">User Management</h2>
            <Link
              href="/users"
              className="block p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">View Users</h3>
              <p>See all users and manage them</p>
            </Link>
            <Link
              href="/users/create"
              className="block p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Create User</h3>
              <p>Add a new user to the system</p>
            </Link>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700">Post Management</h2>
            <Link
              href="/posts"
              className="block p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">View Posts</h3>
              <p>See all posts and manage them</p>
            </Link>
            <Link
              href="/posts/create"
              className="block p-6 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Create Post</h3>
              <p>Add a new post to the system</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
