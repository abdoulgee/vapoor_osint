/**
 * Zustand auth store: manages authentication state, login, register, and logout.
 */

import { create } from 'zustand';
import client from '../api/client';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await client.post('/auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.detail || 'Login failed',
                loading: false,
            });
            return false;
        }
    },

    register: async (email, fullName, password) => {
        set({ loading: true, error: null });
        try {
            const response = await client.post('/auth/register', {
                email,
                full_name: fullName,
                password,
            });
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.detail || 'Registration failed',
                loading: false,
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, error: null });
    },

    clearError: () => set({ error: null }),

    fetchMe: async () => {
        try {
            const response = await client.get('/auth/me');
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
        }
    },
}));

export default useAuthStore;
