"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetProjectQuery,
  useAddMemberMutation,
  ProjectRole,
} from "@/lib/services/projectApi";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAssignTaskMutation,
  Task,
} from "@/lib/services/taskApi";
import {
  TaskList,
  TaskFormModal,
  AddMemberModal,
  AssignTaskModal,
} from "@/components/organisms";
import { ConfirmModal } from "@/components/molecules";
import { PageLayout, PageHeader, LoadingState, ErrorState } from "@/components/templates";
import { Button, Card } from "@/components/atoms";

const MOCK_USER_ID = 1;

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const { data: project, isLoading: projectLoading, error: projectError } = useGetProjectQuery({
    userId: MOCK_USER_ID,
    projectId,
  });

  const { data: tasks, isLoading: tasksLoading } = useGetTasksQuery({
    userId: MOCK_USER_ID,
    projectId,
  });

  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();
  const [assignTask, { isLoading: isAssigningTask }] = useAssignTaskMutation();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [taskToAssign, setTaskToAssign] = useState<number | null>(null);

  const isOwner = project?.ownerId === MOCK_USER_ID;

  const handleAddMember = async (data: { userId: number; role: ProjectRole }) => {
    await addMember({
      projectId,
      userId: MOCK_USER_ID,
      data: {
        memberUserId: data.userId,
        role: data.role,
      },
    }).unwrap();
    setShowAddMemberModal(false);
  };

  const handleCreateTask = async (data: { title: string; description?: string; status?: any }) => {
    await createTask({
      projectId,
      data: {
        userId: MOCK_USER_ID,
        title: data.title,
        description: data.description,
        status: data.status,
      },
    }).unwrap();
    setShowCreateTaskModal(false);
  };

  const handleEditTask = async (data: { title: string; description?: string; status?: any }) => {
    if (!selectedTask) return;
    await updateTask({
      taskId: selectedTask.id,
      data: {
        userId: MOCK_USER_ID,
        title: data.title,
        description: data.description,
        status: data.status,
      },
    }).unwrap();
    setShowEditTaskModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async () => {
    if (taskToDelete === null) return;
    await deleteTask({
      userId: MOCK_USER_ID,
      taskId: taskToDelete,
    }).unwrap();
    setShowDeleteTaskModal(false);
    setTaskToDelete(null);
  };

  const handleAssignTask = async (assigneeUserId: number) => {
    if (taskToAssign === null) return;
    await assignTask({
      taskId: taskToAssign,
      userId: MOCK_USER_ID,
      data: {
        assigneeUserId,
      },
    }).unwrap();
    setShowAssignTaskModal(false);
    setTaskToAssign(null);
  };

  if (projectLoading) {
    return <LoadingState />;
  }

  if (projectError || !project) {
    return <ErrorState message="Failed to load project" />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        actions={
          <div className="flex gap-2">
            {isOwner && (
              <Button variant="secondary" onClick={() => setShowAddMemberModal(true)}>
                Add Member
              </Button>
            )}
            <Button variant="primary" onClick={() => setShowCreateTaskModal(true)}>
              Create Task
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Members</h3>
            <div className="space-y-2">
              {project.members.map((member) => (
                <div key={member.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{member.user.name || member.user.email}</div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
      </div>
      {tasksLoading ? (
        <LoadingState />
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowEditTaskModal(true);
          }}
          onDelete={(id) => {
            setTaskToDelete(id);
            setShowDeleteTaskModal(true);
          }}
          onAssign={(id) => {
            setTaskToAssign(id);
            setShowAssignTaskModal(true);
          }}
          currentUserId={MOCK_USER_ID}
        />
      )}

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSubmit={handleAddMember}
        isLoading={isAddingMember}
      />

      <TaskFormModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreatingTask}
      />

      <TaskFormModal
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
        task={selectedTask || undefined}
        isLoading={isUpdatingTask}
      />

      <ConfirmModal
        isOpen={showDeleteTaskModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => {
          setShowDeleteTaskModal(false);
          setTaskToDelete(null);
        }}
        isLoading={isDeletingTask}
      />

      <AssignTaskModal
        isOpen={showAssignTaskModal}
        onClose={() => {
          setShowAssignTaskModal(false);
          setTaskToAssign(null);
        }}
        onSubmit={handleAssignTask}
        isLoading={isAssigningTask}
      />
    </PageLayout>
  );
}
