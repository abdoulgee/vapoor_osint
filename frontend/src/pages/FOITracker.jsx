/**
 * FOITracker — SOC-styled FOI request tracking table.
 */

import { useState, useEffect } from 'react';
import client from '../api/client';
import useAuthStore from '../stores/authStore';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function FOITracker() {
    const { user } = useAuthStore();
    const toast = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ case_id: '', agency_name: '', request_date: '', notes: '' });
    const [cases, setCases] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    const canCreate = ['admin', 'manager'].includes(user?.role);

    useEffect(() => { fetchAll(); }, [statusFilter]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [foiRes, casesRes] = await Promise.all([
                client.get('/foi/', { params: statusFilter ? { response_status: statusFilter } : {} }),
                client.get('/cases/'),
            ]);
            setRequests(foiRes.data.items || foiRes.data);
            setCases(casesRes.data.items || []);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await client.post('/foi/', form);
            toast('FOI request filed', 'success');
            setShowCreate(false);
            setForm({ case_id: '', agency_name: '', request_date: '', notes: '' });
            fetchAll();
        } catch (err) { toast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-cyber-400 font-mono text-xs">▸</span>
                    <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">FOI Registry</h1>
                    <span className="text-[10px] font-mono text-soc-500">[{requests.length}]</span>
                </div>
                <div className="flex items-center gap-2">
                    <select className="cyber-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">ALL STATUS</option>
                        <option value="pending">PENDING</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="completed">COMPLETED</option>
                    </select>
                    {canCreate && (
                        <button onClick={() => setShowCreate(true)} className="cyber-btn text-[10px] py-1.5 px-3">
                            [+ FOI REQUEST]
                        </button>
                    )}
                </div>
            </div>

            <div className="soc-panel overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-8"><span className="font-mono text-cyber-400 text-xs animate-pulse">LOADING...</span></div>
                ) : (
                    <table className="w-full text-[10px] font-mono">
                        <thead>
                            <tr className="border-b border-soc-700 bg-soc-800/30">
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Agency</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-2 px-3 text-soc-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r.id} className="border-b border-soc-700/30 hover:bg-soc-800/30">
                                    <td className="py-2 px-3 text-cyber-50">{r.agency_name}</td>
                                    <td className="py-2 px-3 text-soc-400 tabular-nums">{r.request_date}</td>
                                    <td className="py-2 px-3">
                                        <span className={`px-1.5 py-0.5 text-[9px] uppercase ${r.response_status === 'completed' ? 'evidence-approved' : r.response_status === 'pending' ? 'evidence-pending' : 'status-investigating'
                                            }`}>{r.response_status}</span>
                                    </td>
                                    <td className="py-2 px-3 text-soc-400 truncate max-w-xs">{r.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="File FOI Request">
                <form onSubmit={handleCreate} className="space-y-3 font-mono">
                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Case</label>
                        <select className="cyber-select w-full" value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })} required>
                            <option value="">Select case...</option>
                            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Agency</label>
                        <input className="cyber-input" value={form.agency_name} placeholder="Agency name..." onChange={(e) => setForm({ ...form, agency_name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Date</label>
                        <input type="date" className="cyber-input" value={form.request_date} onChange={(e) => setForm({ ...form, request_date: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Notes</label>
                        <textarea className="cyber-input min-h-[60px] resize-none" value={form.notes} placeholder="Details..." onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <button type="submit" className="cyber-btn w-full py-2">[FILE REQUEST]</button>
                </form>
            </Modal>
        </div>
    );
}
