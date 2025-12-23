import Link from "next/link";

const Home = () => {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">
            <span className="text-orange-500">Sun*</span> HRIS
          </h1>
          <p className="text-lg text-gray-600">Human Resource Information System</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/time-records"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-orange-500"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              📅 Daily Time Record
            </h2>
            <p className="text-gray-600">
              Track your attendance and work hours
            </p>
          </Link>
          <Link
            href="/users"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              👥 User Management
            </h2>
            <p className="text-gray-600">See all users and manage them</p>
          </Link>
          <Link
            href="/users/create"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              ➕ Create User
            </h2>
            <p className="text-gray-600">Add a new user to the system</p>
          </Link>
          <Link
            href="/leaves"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-500 opacity-60 cursor-not-allowed pointer-events-none"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              🌴 My Leaves
            </h2>
            <p className="text-gray-600">Manage leave requests (Coming Soon)</p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
