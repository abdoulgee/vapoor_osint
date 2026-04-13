/**
 * UserManagement — SOC-styled admin user management panel.
 */

import { useState, useEffect } from 'react';
import client from '../api/client';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await client.get('/users/');
            setUsers(res.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await client.put(`/users/${userId}`, { role });
            fetchUsers();
        } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
    };

    const handleToggleActive = async (userId, isActive) => {
        try {
            await client.put(`/users/${userId}`, { is_active: !isActive });
            fetchUsers();
        } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
                <span className="text-cyber-400 font-mono text-xs">▸</span>
                <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">Operator Registry</h1>
                <span className="text-[10px] font-mono text-soc-500">[{users.length} OPERATORS]</span>
            </div>

            <div className="soc-panel overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-8"><span className="font-mono text-cyber-400 text-xs animate-pulse">LOADING...</span></div>
                ) : (
                    <table className="w-full text-[10px] font-mono">
                        <thead>
                            <tr className="border-b border-soc-700 bg-soc-800/30">
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Operator</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">ID</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Clearance</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-soc-700/30 hover:bg-soc-800/30">
                                    <td className="py-2 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center text-cyber-400 text-[9px] font-bold">
                                                {u.full_name?.charAt(0)}
                                            </div>
                                            <span className="text-cyber-50">{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-soc-400">{u.email}</td>
                                    <td className="py-2 px-3">
                                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            className="cyber-select text-[9px] py-0.5">
                                            <option value="admin">ADMIN</option>
                                            <option value="manager">MANAGER</option>
                                            <option value="analyst">ANALYST</option>
                                        </select>
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className={`text-[9px] uppercase px-1.5 py-0.5 ${u.is_active ? 'evidence-approved' : 'evidence-rejected'}`}>
                                            {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3">
                                        <button onClick={() => handleToggleActive(u.id, u.is_active)}
                                            className={`text-[9px] uppercase tracking-wider transition-colors ${u.is_active ? 'text-soc-500 hover:text-threat-critical' : 'text-soc-500 hover:text-cyber-400'
                                                }`}>
                                            [{u.is_active ? 'DEACTIVATE' : 'ACTIVATE'}]
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
