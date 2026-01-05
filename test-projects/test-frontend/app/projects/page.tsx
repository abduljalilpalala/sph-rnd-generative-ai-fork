"use client";

import { useState } from "react";
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from "@/lib/services/projectApi";
import { ProjectList, ProjectFormModal } from "@/components/organisms";
import { ConfirmModal } from "@/components/molecules";
import { PageLayout, PageHeader, LoadingState, ErrorState } from "@/components/templates";
import { Button } from "@/components/atoms";

const MOCK_USER_ID = 1;

export default function ProjectsPage() {
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

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load projects" />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Projects"
        actions={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create Project
          </Button>
        }
      />
      <ProjectList
        projects={projects}
        onDelete={handleDeleteClick}
        currentUserId={MOCK_USER_ID}
      />

      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
          setDeleteError(null);
        }}
        isLoading={isDeleting}
      />
    </PageLayout>
  );
}
