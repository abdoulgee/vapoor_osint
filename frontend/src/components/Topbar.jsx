/**
 * Topbar — SOC Status Bar. Now flow-based (not fixed) so flexbox layout works.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import NotificationBell from './NotificationBell';

export default function Topbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };
    const utcTime = time.toISOString().slice(11, 19);

    return (
        <header className="h-10 shrink-0 bg-soc-900 border-b border-soc-700/60 flex items-center justify-between px-3 font-mono z-30">
            {/* Left: System Status */}
            <div className="flex items-center gap-4 text-[10px] tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-pulse-glow" />
                    <span className="text-cyber-400">SYS:ONLINE</span>
                </div>
                <span className="text-soc-700">│</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-soc-300">NODES:</span>
                    <span className="text-cyber-400">4</span>
                </div>
                <span className="text-soc-700">│</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-soc-300">THREAT:</span>
                    <span className="text-threat-medium threat-pulse font-bold">ELEVATED</span>
                </div>
            </div>

            {/* Center */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-[10px] text-soc-500 tracking-[0.3em] uppercase">VAPOR SCAN</span>
                <span className="text-[10px] text-soc-700">//</span>
                <span className="text-[10px] text-cyber-400/50 tracking-wider">OSINT PLATFORM</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 text-[10px]">
                <NotificationBell />
                <span className="text-soc-700">│</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center text-cyber-400 text-[9px] font-bold">
                        {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-soc-300 hidden md:inline">{user?.full_name?.split(' ')[0]}</span>
                    <span className="text-cyber-400/60 uppercase text-[9px] border border-cyber-400/20 px-1 rounded-sm">{user?.role}</span>
                </div>
                <span className="text-soc-700">│</span>
                <span className="text-cyber-400 tabular-nums">{utcTime}</span>
                <span className="text-soc-700">│</span>
                <button onClick={handleLogout} className="text-soc-400 hover:text-threat-critical transition-colors uppercase tracking-wider" title="Logout">
                    [EXIT]
                </button>
            </div>
        </header>
    );
}
