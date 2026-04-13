/**
 * Zustand case store: manages case data, CRUD operations, and assignments.
 */

import { create } from 'zustand';
import client from '../api/client';

const useCaseStore = create((set, get) => ({
    cases: [],
    currentCase: null,
    total: 0,
    loading: false,
    error: null,

    fetchCases: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await client.get('/cases/', { params });
            set({ cases: response.data.items, total: response.data.total, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to fetch cases', loading: false });
        }
    },

    fetchCase: async (id) => {
        set({ loading: true });
        try {
            const response = await client.get(`/cases/${id}`);
            set({ currentCase: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to fetch case', loading: false });
            return null;
        }
    },

    createCase: async (data) => {
        try {
            const response = await client.post('/cases/', data);
            set((state) => ({ cases: [response.data, ...state.cases] }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to create case' });
            return null;
        }
    },

    updateCase: async (id, data) => {
        try {
            const response = await client.put(`/cases/${id}`, data);
            set((state) => ({
                cases: state.cases.map((c) => (c.id === id ? response.data : c)),
                currentCase: state.currentCase?.id === id ? response.data : state.currentCase,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to update case' });
            return null;
        }
    },

    deleteCase: async (id) => {
        try {
            await client.delete(`/cases/${id}`);
            set((state) => ({ cases: state.cases.filter((c) => c.id !== id) }));
            return true;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to delete case' });
            return false;
        }
    },

    assignUsers: async (caseId, userIds) => {
        try {
            const response = await client.post(`/cases/${caseId}/assign`, { user_ids: userIds });
            set((state) => ({
                currentCase: state.currentCase?.id === caseId ? response.data : state.currentCase,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to assign users' });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useCaseStore;
