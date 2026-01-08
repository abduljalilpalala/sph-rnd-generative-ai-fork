import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface File {
  id: number;
  originalName: string;
  storedName: string;
  s3Key: string;
  s3Bucket: string;
  mimeType: string;
  fileType: "IMAGE" | "DOCUMENT";
  size: number;
  status: "PENDING" | "UPLOADING" | "COMPLETED" | "FAILED";
  uploadedById: number;
  projectId?: number;
  taskId?: number;
  metadata?: any;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface FileQueryParams {
  userId?: number;
  projectId?: number;
  taskId?: number;
  fileType?: "IMAGE" | "DOCUMENT";
  limit?: number;
  offset?: number;
}

export interface BatchUploadResponse {
  batchId: string;
  totalFiles: number;
}

export interface BatchProgress {
  totalFiles: number;
  completed: number;
  failed: number;
  inProgress: number;
}

export const fileApi = createApi({
  reducerPath: "fileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/files`,
  }),
  tagTypes: ["File"],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<File, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["File"],
    }),

    uploadBatch: builder.mutation<BatchUploadResponse, FormData>({
      query: (formData) => ({
        url: "/upload/batch",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["File"],
    }),

    getBatchProgress: builder.query<BatchProgress, string>({
      query: (batchId) => `/batch/${batchId}/progress`,
    }),

    getFiles: builder.query<File[], FileQueryParams>({
      query: (params) => ({
        url: "",
        params,
      }),
      providesTags: ["File"],
    }),

    getFile: builder.query<File, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "File", id }],
    }),

    getDownloadUrl: builder.query<
      { url: string; expiresIn: number },
      number
    >({
      query: (id) => `/${id}/download-url`,
    }),

    deleteFile: builder.mutation<void, { id: number; userId: number }>({
      query: ({ id, userId }) => ({
        url: `/${id}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["File"],
    }),

    deleteBatch: builder.mutation<
      { deleted: number },
      { fileIds: number[]; userId: number }
    >({
      query: (body) => ({
        url: "/batch",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["File"],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useUploadBatchMutation,
  useGetBatchProgressQuery,
  useGetFilesQuery,
  useGetFileQuery,
  useGetDownloadUrlQuery,
  useDeleteFileMutation,
  useDeleteBatchMutation,
} = fileApi;
