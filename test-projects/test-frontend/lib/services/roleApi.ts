import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export const roleApi = createApi({
  reducerPath: "roleApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => "/roles",
      providesTags: ["Role"],
    }),
    getRole: builder.query<Role, number>({
      query: (id) => `/roles/${id}`,
      providesTags: ["Role"],
    }),
    createRole: builder.mutation<Role, CreateRoleDto>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<Role, { id: number; data: UpdateRoleDto }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
