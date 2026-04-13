/**
 * Zustand marker store: manages geospatial marker data and operations.
 */

import { create } from 'zustand';
import client from '../api/client';

const useMarkerStore = create((set) => ({
    markers: [],
    currentMarker: null,
    total: 0,
    loading: false,
    error: null,

    fetchMarkers: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await client.get('/markers/', { params });
            set({ markers: response.data.items, total: response.data.total, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to fetch markers', loading: false });
        }
    },

    createMarker: async (data) => {
        try {
            const response = await client.post('/markers/', data);
            set((state) => ({ markers: [response.data, ...state.markers] }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to create marker' });
            return null;
        }
    },

    updateMarker: async (id, data) => {
        try {
            const response = await client.put(`/markers/${id}`, data);
            set((state) => ({
                markers: state.markers.map((m) => (m.id === id ? response.data : m)),
                currentMarker: state.currentMarker?.id === id ? response.data : state.currentMarker,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to update marker' });
            return null;
        }
    },

    deleteMarker: async (id) => {
        try {
            await client.delete(`/markers/${id}`);
            set((state) => ({ markers: state.markers.filter((m) => m.id !== id) }));
            return true;
        } catch (error) {
            set({ error: error.response?.data?.detail || 'Failed to delete marker' });
            return false;
        }
    },

    setCurrentMarker: (marker) => set({ currentMarker: marker }),
    clearError: () => set({ error: null }),
}));

export default useMarkerStore;
