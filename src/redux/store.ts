// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './loginSlice';
import filtersReducer from './filtersSlice'

export const store = configureStore({
    reducer: {
        login: loginReducer,
        filters: filtersReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
