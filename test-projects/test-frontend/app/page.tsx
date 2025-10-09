import Link from "next/link";

const Home = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Management System</h1>
        <div className="grid gap-4">
          <Link
            href="/users"
            className="block p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">View Users</h2>
            <p>See all users and manage them</p>
          </Link>
          <Link
            href="/users/create"
            className="block p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Create User</h2>
            <p>Add a new user to the system</p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
