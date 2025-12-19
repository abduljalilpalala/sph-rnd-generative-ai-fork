"use client";

import { useState } from "react";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { PageLayout, PageHeader, LoadingState } from "@/components/templates";
import { Card, Button, Input, Text } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";

export default function UserSearchPage() {
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const {
    users,
    total,
    page,
    totalPages,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    handleSearch,
    handleNextPage,
    handlePreviousPage,
  } = useSearchUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(nameInput, emailInput);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Search Users"
        actions={[
          { href: "/users", label: "Back to Users", variant: "secondary" },
        ]}
      />

      {/* Search Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Search by name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Search by email..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Search
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setNameInput("");
                setEmailInput("");
                handleSearch("", "");
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4">
              <Text variant="body">
                Found {total} user{total !== 1 ? "s" : ""} {total > 0 && `(Page ${page} of ${totalPages})`}
              </Text>
            </div>

            {/* Results Table */}
            {users.length === 0 ? (
              <Card>
                <EmptyState message="No users found. Try a different search." />
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                    <Text variant="body">
                      Page {page} of {totalPages}
                    </Text>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
