"use client";

import { useState } from "react";
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from "@/lib/services/projectApi";
import { ProjectList, ProjectFormModal, Sidebar, TopNavigation } from "@/components/organisms";
import { ConfirmDialog } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const MOCK_USER_ID = 1;

export default function ProjectsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: projects, isLoading, error } = useGetProjectsQuery(MOCK_USER_ID);
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreate = async (data: { name: string; description?: string }) => {
    await createProject({
      userId: MOCK_USER_ID,
      name: data.name,
      description: data.description,
    }).unwrap();
    setShowCreateModal(false);
  };

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete === null) return;

    try {
      await deleteProject({
        userId: MOCK_USER_ID,
        projectId: projectToDelete,
      }).unwrap();
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError("Failed to delete project. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Project Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your projects and tasks
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
              >
                Create Project
              </button>
            </div>

            {/* Content */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading projects...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Error loading projects</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            )}

            {!isLoading && !error && (
              <ProjectList
                projects={projects}
                onDelete={handleDeleteClick}
                currentUserId={MOCK_USER_ID}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
          setDeleteError(null);
        }}
        variant="danger"
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </div>
  );
}
