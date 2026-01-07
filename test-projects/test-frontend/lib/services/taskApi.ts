import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum TaskStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  FOR_REVIEW = "FOR_REVIEW",
  CLOSED = "CLOSED",
}

export interface TaskAssignment {
  id: number;
  taskId: number;
  userId: number;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: number;
  createdById: number;
  createdBy: {
    id: number;
    email: string;
    name: string | null;
  };
  assignments: TaskAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  userId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  userId: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface AssignTaskDto {
  assigneeUserId: number;
}

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], { userId: number; projectId: number }>({
      query: ({ userId, projectId }) => ({
        url: `/projects/${projectId}/tasks`,
        method: "GET",
        params: { userId },
      }),
      providesTags: ["Task"],
    }),
    createTask: builder.mutation<
      Task,
      { projectId: number; data: CreateTaskDto }
    >({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/tasks`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation<Task, { taskId: number; data: UpdateTaskDto }>({
      query: ({ taskId, data }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation<void, { userId: number; taskId: number }>({
      query: ({ userId, taskId }) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
        params: { userId },
      }),
      invalidatesTags: ["Task"],
    }),
    assignTask: builder.mutation<
      TaskAssignment,
      { taskId: number; userId: number; data: AssignTaskDto }
    >({
      query: ({ taskId, userId, data }) => ({
        url: `/tasks/${taskId}/assign`,
        method: "POST",
        body: { userId, ...data },
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAssignTaskMutation,
} = taskApi;
