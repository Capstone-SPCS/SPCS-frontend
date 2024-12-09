// src/store/slices/loginSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
    isAuthenticated: boolean;
    user: string | null;
    token: string | null;
}

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
    token: null,
};

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        isAuthenticated: false,
        user: '',
        token: '',
    },
    reducers: {
        authenticate(state, action: PayloadAction<{ user: string; token: string }>) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        unauthenticate(state) {
            state.isAuthenticated = false;
            state.user = '';
            state.token = '';
        },
    },
});

export const { authenticate, unauthenticate } = loginSlice.actions;
export default loginSlice.reducer;
