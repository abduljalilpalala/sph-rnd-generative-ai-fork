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
  TaskBoard,
  TaskFormModal,
  AddMemberModal,
  AssignTaskModal,
  Sidebar,
  TopNavigation,
} from "@/components/organisms";
import { ConfirmDialog } from "@/components/molecules";
import { Card } from "@/components/atoms";

const MOCK_USER_ID = 1;

export default function ProjectDetailPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleStatusChange = async (taskId: number, newStatus: any) => {
    await updateTask({
      taskId,
      data: {
        userId: MOCK_USER_ID,
        status: newStatus,
      },
    }).unwrap();
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
          pageTitle="Project Details"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Loading State */}
            {projectLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {projectError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Error loading project</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            )}

            {/* Project Content */}
            {!projectLoading && !projectError && project && (
              <>
                {/* Page Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isOwner && (
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="bg-gray-500 text-white hover:bg-gray-600 font-bold rounded transition py-2 px-4"
                      >
                        Add Member
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreateTaskModal(true)}
                      className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
                    >
                      Create Task
                    </button>
                  </div>
                </div>

                {/* Project Members */}
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

                {/* Tasks Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Tasks Board</h3>
                  <p className="text-sm text-gray-600">Drag and drop tasks between columns to update their status</p>
                </div>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading tasks...</p>
                    </div>
                  </div>
                ) : (
                  <TaskBoard
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
                    onStatusChange={handleStatusChange}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
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

      <ConfirmDialog
        isOpen={showDeleteTaskModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteTask}
        onClose={() => {
          setShowDeleteTaskModal(false);
          setTaskToDelete(null);
        }}
        variant="danger"
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
    </div>
  );
}
