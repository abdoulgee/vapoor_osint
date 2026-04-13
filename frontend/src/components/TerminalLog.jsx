/**
 * TerminalLog — Scrolling hacker-style console showing real-time system events.
 */

import { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export default function TerminalLog({ caseId, maxLines = 30 }) {
    const [logs, setLogs] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [caseId]);

    const fetchLogs = async () => {
        try {
            const url = caseId ? `/timeline/${caseId}` : '/audit-logs/';
            const res = await client.get(url, { params: { limit: maxLines } });
            const items = res.data.items || res.data;
            setLogs(items);
        } catch { /* silent */ }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toISOString().slice(11, 19);
    };

    const actionColors = {
        marker_added: 'text-cyber-400',
        marker_updated: 'text-threat-info',
        marker_deleted: 'text-threat-critical',
        evidence_uploaded: 'text-threat-medium',
        evidence_approved: 'text-cyber-400',
        evidence_rejected: 'text-threat-critical',
        status_changed: 'text-threat-info',
        user_assigned: 'text-cyber-300',
        case_created: 'text-cyber-400',
        created: 'text-cyber-400',
        updated: 'text-threat-info',
        deleted: 'text-threat-critical',
        approved: 'text-cyber-400',
        rejected: 'text-threat-critical',
        login: 'text-soc-400',
    };

    return (
        <div className="soc-panel flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-soc-700">
                <div className="flex items-center gap-2">
                    <span className="text-cyber-400 text-[10px]">▸</span>
                    <span className="text-[10px] font-mono text-cyber-400 uppercase tracking-wider">Terminal</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-soc-500">LIVE</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 max-h-48 bg-soc-950">
                {logs.length === 0 ? (
                    <div className="text-[10px] font-mono text-soc-600 py-2">
                        <p>{'>'} Waiting for events...</p>
                        <p className="mt-0.5">{'>'} <span className="animate-terminal">_</span></p>
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const action = log.action_type || log.action;
                        const color = actionColors[action] || 'text-soc-400';
                        const description = log.description || `${log.action} ${log.entity_type || ''}`;
                        const user = log.user?.full_name || '';
                        const time = formatTime(log.created_at);

                        return (
                            <div key={log.id || i} className="flex gap-2 py-0.5 text-[10px] font-mono leading-relaxed">
                                <span className="text-soc-600 tabular-nums shrink-0">{time}</span>
                                <span className={`shrink-0 ${color}`}>[{(action || 'event').toUpperCase().replace('_', '.')}]</span>
                                <span className="text-cyber-50/80 truncate">{description}</span>
                                {user && <span className="text-soc-600 shrink-0 ml-auto">— {user}</span>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
