import { apiManager } from "../apiManager"

export interface UploadResponse {
  url: string
}

export const uploadApi = apiManager.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append("file", file)
        return { url: "/upload", method: "POST", body: formData }
      },
    }),
  }),
  overrideExisting: false,
})

export const { useUploadFileMutation } = uploadApi
