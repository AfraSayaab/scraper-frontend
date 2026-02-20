import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const scraperApi = createApi({
    reducerPath: 'scraperApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/safer` }),
    endpoints: (builder) => ({
        fetchFileDetails: builder.query({
            query: () => '/list-files',
        }),
        fetchRunningFile: builder.query({
            query: () => '/get-current-running-file',
        }),
        startScraping: builder.mutation({
            query: (data) => ({
                url: '/start-scraping',
                method: 'POST',
                body: data,
            }),
        }),
        stopScraping: builder.mutation({
            query: (data) => ({
                url: '/stop-scraping',
                method: 'POST',
                body: data,
            }),
        }),
        deleteFile: builder.mutation({
            query: ({ fileName }) => ({
                url: '/delete-file',
                method: 'DELETE',
                params: { fileName },
            }),
        }),
        uploadFile: builder.mutation({
            query: (formData) => ({
                url: '/upload-file',
                method: 'POST',
                body: formData,
            }),
        }),
        downloadFile: builder.mutation({
            query: ({ fileName }) => ({
                url: '/downlaod-file',
                method: 'GET',
                params: { fileName },
                responseHandler: (response) => response.blob(),
            }),
        }),
        startScrapingAll: builder.mutation({
            query: (data) => ({
              url: '/scrapAll',
              method: 'POST',
              body: data,
              headers: {
                'Content-Type': 'application/json', // Ensures the server knows this is JSON
              },
            }),
          }),
        stopScrapingAll: builder.mutation({
            query: () => ({
                url: '/stopAll',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useFetchFileDetailsQuery,
    useFetchRunningFileQuery,
    useStartScrapingMutation,
    useStopScrapingMutation,
    useDeleteFileMutation,
    useUploadFileMutation,
    useDownloadFileMutation,
    useStartScrapingAllMutation,
    useStopScrapingAllMutation,
} = scraperApi;

export default scraperApi;