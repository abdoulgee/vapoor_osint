/**
 * Toast — SOC-style flash alert notification system.
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(onRemove, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, []);

    const styles = {
        success: 'border-l-cyber-400 bg-cyber-400/5 text-cyber-400',
        error: 'border-l-threat-critical bg-threat-critical/5 text-threat-critical',
        warning: 'border-l-threat-medium bg-threat-medium/5 text-threat-medium',
        info: 'border-l-threat-info bg-threat-info/5 text-threat-info',
    };

    const icons = { success: '[✓]', error: '[✗]', warning: '[!]', info: '[i]' };

    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 border border-soc-700 border-l-2 bg-soc-900 shadow-cyber animate-slide-in ${styles[toast.type] || styles.info}`}>
            <span className="font-mono text-[10px] font-bold">{icons[toast.type]}</span>
            <p className="text-[11px] font-mono flex-1">{toast.message}</p>
            <button onClick={onRemove} className="text-soc-500 hover:text-cyber-50 text-[10px] font-mono">[×]</button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed bottom-3 right-3 z-[100] space-y-1.5 max-w-sm">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
