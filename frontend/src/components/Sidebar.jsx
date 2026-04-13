/**
 * Sidebar — SOC slim nav. Now flow-based (not fixed) for flex layout.
 */

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const navItems = [
    { path: '/command-center', label: 'COMMAND', icon: '⊕', roles: ['admin', 'manager', 'analyst'] },
    { path: '/dashboard', label: 'ANALYTICS', icon: '◈', roles: ['admin', 'manager', 'analyst'] },
    { path: '/cases', label: 'CASES', icon: '◉', roles: ['admin', 'manager', 'analyst'] },
    { path: '/osint', label: 'OSINT', icon: '⊛', roles: ['admin', 'manager', 'analyst'] },
    { path: '/foi', label: 'FOI LOG', icon: '◎', roles: ['admin', 'manager', 'analyst'] },
    { path: '/audit-logs', label: 'AUDIT', icon: '◆', roles: ['admin'] },
    { path: '/users', label: 'USERS', icon: '◇', roles: ['admin'] },
];

export default function Sidebar() {
    const { user } = useAuthStore();
    const [expanded, setExpanded] = useState(false);

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className={`h-full shrink-0 flex flex-col bg-soc-900 border-r border-soc-700/60 transition-all duration-200 z-40 ${expanded ? 'w-44' : 'w-14'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-2 px-3 h-10 border-b border-soc-700/60 overflow-hidden shrink-0">
                <div className="w-8 h-8 min-w-[2rem] flex items-center justify-center text-cyber-400 text-sm font-bold font-mono">◈</div>
                <div className={`transition-opacity duration-150 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-[10px] font-mono text-cyber-400 tracking-[0.2em] uppercase">VAPOR</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-2 space-y-0.5 overflow-hidden">
                {visibleItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={!expanded ? item.label : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-2 mx-1 px-3 py-2 font-mono text-[11px] tracking-wider transition-all duration-150 overflow-hidden border-l-2 ${isActive
                                ? 'border-cyber-400 text-cyber-400 bg-cyber-400/5'
                                : 'border-transparent text-soc-400 hover:text-cyber-400/80 hover:bg-soc-800/50 hover:border-soc-600'
                            }`
                        }
                    >
                        <span className="min-w-[1rem] text-center text-xs">{item.icon}</span>
                        <span className={`whitespace-nowrap transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-2 border-t border-soc-700/60 overflow-hidden shrink-0">
                <p className={`text-[8px] font-mono text-soc-600 tracking-widest transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}>v2.0 // SOC</p>
            </div>
        </aside>
    );
}
