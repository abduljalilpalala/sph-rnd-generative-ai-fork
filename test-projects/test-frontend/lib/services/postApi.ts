import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  content?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    getPost: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    createPost: builder.mutation<Post, CreatePostDto>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
    updatePost: builder.mutation<Post, { id: number; data: UpdatePostDto }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
