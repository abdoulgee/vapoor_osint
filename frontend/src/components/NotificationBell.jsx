/**
 * NotificationBell — SOC-style alert indicator.
 */

import { useState, useEffect, useRef } from 'react';
import useNotificationStore from '../stores/notificationStore';

export default function NotificationBell() {
    const { notifications, unreadCount, fetchNotifications, markRead } = useNotificationStore();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => { fetchNotifications(); }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className={`text-[10px] font-mono tracking-wider transition-colors ${unreadCount > 0 ? 'text-threat-medium' : 'text-soc-400'
                    } hover:text-cyber-400`}
            >
                {unreadCount > 0 ? `[${unreadCount} ALERT${unreadCount > 1 ? 'S' : ''}]` : '[ALERTS]'}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-soc-900 border border-soc-700 shadow-cyber-lg z-50 animate-fade-in">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-400/40 to-transparent" />
                    <div className="px-3 py-2 border-b border-soc-700 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyber-400 uppercase tracking-wider">System Alerts</span>
                        <span className="text-[9px] font-mono text-soc-500">{notifications.length}</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center text-soc-500 text-[10px] font-mono py-4">NO PENDING ALERTS</p>
                        ) : (
                            notifications.slice(0, 8).map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    className={`px-3 py-2 border-b border-soc-700/30 cursor-pointer transition-colors hover:bg-soc-800/50 ${!n.is_read ? 'border-l-2 border-l-cyber-400' : ''
                                        }`}
                                >
                                    <p className="text-[10px] font-mono text-cyber-50">{n.message}</p>
                                    <p className="text-[9px] font-mono text-soc-500 mt-0.5">
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
