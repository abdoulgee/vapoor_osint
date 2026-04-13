/**
 * AuditLogs — SOC-styled admin audit log viewer.
 */

import { useState, useEffect } from 'react';
import client from '../api/client';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const res = await client.get('/audit-logs/', { params: { limit: 100 } });
            setLogs(res.data.items || res.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const actionColors = {
        created: 'text-cyber-400', updated: 'text-threat-info', deleted: 'text-threat-critical',
        login: 'text-soc-400', approved: 'text-cyber-400', rejected: 'text-threat-critical',
        uploaded: 'text-threat-medium', assigned_users: 'text-cyber-300',
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
                <span className="text-cyber-400 font-mono text-xs">▸</span>
                <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">Audit Registry</h1>
                <span className="text-[10px] font-mono text-soc-500">[{logs.length} RECORDS]</span>
            </div>

            <div className="soc-panel overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-8"><span className="font-mono text-cyber-400 text-xs animate-pulse">LOADING...</span></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px] font-mono">
                            <thead>
                                <tr className="border-b border-soc-700 bg-soc-800/30">
                                    <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Time</th>
                                    <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Action</th>
                                    <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Entity</th>
                                    <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-b border-soc-700/30 hover:bg-soc-800/30">
                                        <td className="py-2 px-3 text-soc-400 tabular-nums whitespace-nowrap">
                                            {new Date(log.created_at).toISOString().slice(0, 19).replace('T', ' ')}
                                        </td>
                                        <td className={`py-2 px-3 uppercase ${actionColors[log.action] || 'text-soc-400'}`}>
                                            [{log.action}]
                                        </td>
                                        <td className="py-2 px-3 text-cyber-50">
                                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                                        </td>
                                        <td className="py-2 px-3 text-soc-400">{log.user?.full_name || `User #${log.user_id}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
