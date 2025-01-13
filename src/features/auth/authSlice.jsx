// src/features/auth/authApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Fetch the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL;

// Retrieve token from localStorage
const token = localStorage.getItem('authToken');


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/admin`,
    prepareHeaders: (headers) => {
      // If token exists, add it to the Authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (signupData) => ({
        url: '/signup',
        method: 'POST',
        body: signupData,
      }),
    }),
    login: builder.mutation({
      query: (loginData) => ({
        url: '/login',
        method: 'POST',
        body: loginData,
      }),
      // After login, store the token in localStorage
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            // Store the token in localStorage
            console.log("The token is:  ",token);
            localStorage.setItem('authToken', data.token);
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
  }),
});

export const { useSignupMutation, useLoginMutation } = authApi;
