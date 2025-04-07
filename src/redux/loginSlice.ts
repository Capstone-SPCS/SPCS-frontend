// src/store/slices/loginSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
    isAuthenticated?: boolean;
    id: string | null;
    user: string | null;
    token: string | null;
    role: string | null;
}

const initialState: LoginState = {
    isAuthenticated: false,
    id: null,
    user: null,
    token: null,
    role: null,
};

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        authenticate(state, action: PayloadAction<LoginState>) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.id = action.payload.id
        },
        unauthenticate(state) {
            state.isAuthenticated = false;
            state.user = '';
            state.token = '';
            state.role = '';
            state.id = '';
        },
    },
});

export const { authenticate, unauthenticate } = loginSlice.actions;
export default loginSlice.reducer;
