import { configureStore } from '@reduxjs/toolkit';
import { authApi } from 'features/auth/authSlice';
import {scraperApi} from 'features/scraper/scraperSlice';

// Combine all reducers and API slices
const rootReducer = {
    [authApi.reducerPath]: authApi.reducer,
    [scraperApi.reducerPath]: scraperApi.reducer,
};

// Combine all middlewares
const middleware = (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware,scraperApi.middleware);


export const store = configureStore({
    reducer: rootReducer,
    middleware,
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;