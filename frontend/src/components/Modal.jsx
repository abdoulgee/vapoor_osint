/**
 * Modal — SOC terminal-style modal overlay.
 */

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Panel */}
            <div className="relative w-full max-w-lg mx-4 bg-soc-900 border border-soc-700 shadow-cyber-lg">
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-400/60 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-soc-700">
                    <div className="flex items-center gap-2">
                        <span className="text-cyber-400 text-xs">▸</span>
                        <h3 className="text-xs font-mono font-semibold text-cyber-400 uppercase tracking-wider">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-soc-500 hover:text-threat-critical transition-colors font-mono text-xs">
                        [×]
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
