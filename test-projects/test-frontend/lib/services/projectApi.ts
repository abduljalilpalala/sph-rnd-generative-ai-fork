import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum ProjectRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}

export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: ProjectRole;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  owner: {
    id: number;
    email: string;
    name: string | null;
  };
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
}

export interface CreateProjectDto {
  userId: number;
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  userId: number;
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  memberUserId: number;
  role: ProjectRole;
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Project", "ProjectMember"],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], number>({
      query: (userId) => ({
        url: "/projects",
        method: "GET",
        body: { userId },
      }),
      providesTags: ["Project"],
    }),
    getProject: builder.query<Project, { userId: number; projectId: number }>({
      query: ({ userId, projectId }) => ({
        url: `/projects/${projectId}`,
        method: "GET",
        body: { userId },
      }),
      providesTags: (result, error, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation<
      Project,
      { projectId: number; data: UpdateProjectDto }
    >({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
    deleteProject: builder.mutation<void, { userId: number; projectId: number }>({
      query: ({ userId, projectId }) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: ["Project"],
    }),
    addMember: builder.mutation<
      ProjectMember,
      { projectId: number; userId: number; data: AddMemberDto }
    >({
      query: ({ projectId, userId, data }) => ({
        url: `/projects/${projectId}/members`,
        method: "POST",
        body: { userId, ...data },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Project", id: projectId },
        "ProjectMember",
      ],
    }),
    getMembers: builder.query<
      ProjectMember[],
      { userId: number; projectId: number }
    >({
      query: ({ userId, projectId }) => ({
        url: `/projects/${projectId}/members`,
        method: "GET",
        body: { userId },
      }),
      providesTags: ["ProjectMember"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddMemberMutation,
  useGetMembersQuery,
} = projectApi;
