/**
 * Zustand notification store: manages in-app notifications.
 */

import { create } from 'zustand';
import client from '../api/client';

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const response = await client.get('/notifications/');
            set({
                notifications: response.data.items,
                unreadCount: response.data.unread_count,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await client.put(`/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch { /* silent */ }
    },

    markAllRead: async () => {
        try {
            await client.put('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                unreadCount: 0,
            }));
        } catch { /* silent */ }
    },
}));

export default useNotificationStore;
