// src/store/slices/loginSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
    isAuthenticated: boolean;
    user: string | null;
    token: string | null;
    role: string | null;
}

const initialState: LoginState = {
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
};

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        isAuthenticated: false,
        user: '',
        token: '',
        role: '',
    },
    reducers: {
        authenticate(state, action: PayloadAction<{ user: string; token: string; role: string }>) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
        },
        unauthenticate(state) {
            state.isAuthenticated = false;
            state.user = '';
            state.token = '';
            state.role = '';
        },
    },
});

export const { authenticate, unauthenticate } = loginSlice.actions;
export default loginSlice.reducer;
