/**
 * Dashboard — SOC Analytics Grid with hard-edged stat panels.
 */

import { useState, useEffect } from 'react';
import client from '../api/client';
import StatsCard from '../components/StatsCard';
import TerminalLog from '../components/TerminalLog';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await client.get('/analytics/dashboard');
                setStats(res.data);
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 font-mono text-cyber-400 text-xs">
                <span className="animate-pulse">LOADING ANALYTICS...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2">
                <span className="text-cyber-400 font-mono text-xs">▸</span>
                <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">Analytics Overview</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatsCard title="Total Cases" value={stats?.total_cases || 0} icon="◉" color="cyber" subtitle={`${stats?.active_cases || 0} active`} />
                <StatsCard title="Active Ops" value={stats?.active_cases || 0} icon="◈" color="blue" />
                <StatsCard title="High Risk" value={stats?.high_risk_markers || 0} icon="◆" color="red" />
                <StatsCard title="Evidence" value={stats?.total_evidence || 0} icon="▸" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Risk Breakdown */}
                <div className="soc-panel p-4">
                    <h3 className="text-[10px] font-mono text-soc-500 uppercase tracking-wider mb-3">Threat Assessment</h3>
                    <div className="space-y-2.5">
                        {stats?.risk_breakdown && Object.entries(stats.risk_breakdown).map(([level, count]) => {
                            const colors = {
                                low: 'bg-cyber-400', medium: 'bg-threat-medium',
                                high: 'bg-threat-high', critical: 'bg-threat-critical',
                            };
                            const total = Object.values(stats.risk_breakdown).reduce((a, b) => a + b, 1);
                            const pct = Math.round((count / total) * 100);

                            return (
                                <div key={level} className="flex items-center gap-3">
                                    <span className={`text-[9px] font-mono uppercase w-14 risk-${level} px-1 py-0.5 text-center`}>{level}</span>
                                    <div className="flex-1 h-1.5 bg-soc-800 overflow-hidden">
                                        <div className={`h-full ${colors[level]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-[10px] font-mono text-soc-400 w-6 text-right tabular-nums">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Case Status */}
                <div className="soc-panel p-4">
                    <h3 className="text-[10px] font-mono text-soc-500 uppercase tracking-wider mb-3">Case Status</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {stats?.status_breakdown && Object.entries(stats.status_breakdown).map(([status, count]) => (
                            <div key={status} className="text-center p-3 soc-panel">
                                <p className="text-xl font-mono font-bold text-cyber-400">{count}</p>
                                <p className={`text-[9px] font-mono uppercase mt-1 status-${status} px-1 py-0.5 inline-block`}>{status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="soc-panel p-4">
                <h3 className="text-[10px] font-mono text-soc-500 uppercase tracking-wider mb-3">Recent Activity</h3>
                <div className="space-y-1">
                    {stats?.recent_activity?.length > 0 ? (
                        stats.recent_activity.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 py-1.5 border-b border-soc-700/30 last:border-0 font-mono text-[10px]">
                                <span className="text-soc-600 tabular-nums w-14 shrink-0">
                                    {new Date(a.created_at).toISOString().slice(11, 19)}
                                </span>
                                <span className="text-cyber-400 uppercase w-16 shrink-0">[{a.action}]</span>
                                <span className="text-soc-300 truncate">{a.entity_type} #{a.entity_id}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-soc-600 text-[10px] font-mono text-center py-3">NO RECENT ACTIVITY</p>
                    )}
                </div>
            </div>

            {/* Terminal Log */}
            <TerminalLog />
        </div>
    );
}
