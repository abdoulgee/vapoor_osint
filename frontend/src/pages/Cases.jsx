/**
 * Cases — SOC-styled case management grid.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCaseStore from '../stores/caseStore';
import useAuthStore from '../stores/authStore';
import Modal from '../components/Modal';
import CaseForm from '../components/CaseForm';

export default function Cases() {
    const { cases, total, fetchCases, createCase, deleteCase } = useCaseStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const canCreate = ['admin', 'manager'].includes(user?.role);
    const canDelete = ['admin', 'manager'].includes(user?.role);

    useEffect(() => { fetchCases({ search, status: statusFilter }); }, [search, statusFilter]);

    const handleCreate = async (data) => {
        await createCase(data);
        setShowCreate(false);
        fetchCases();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this case?')) {
            await deleteCase(id);
            fetchCases();
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-cyber-400 font-mono text-xs">▸</span>
                    <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">Case Registry</h1>
                    <span className="text-[10px] font-mono text-soc-500">[{total}]</span>
                </div>
                {canCreate && (
                    <button onClick={() => setShowCreate(true)} className="cyber-btn text-[10px] py-1.5 px-3">
                        [+ NEW CASE]
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 font-mono">
                <input className="cyber-input max-w-xs text-xs" value={search} placeholder="Search operations..."
                    onChange={(e) => setSearch(e.target.value)} />
                <select className="cyber-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">ALL STATUS</option>
                    <option value="open">OPEN</option>
                    <option value="investigating">INVESTIGATING</option>
                    <option value="closed">CLOSED</option>
                </select>
            </div>

            {/* Case Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cases.map(c => (
                    <div key={c.id} className="soc-panel p-4 cursor-pointer hover:border-cyber-400/30 transition-colors"
                        onClick={() => navigate(`/cases/${c.id}`)}>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xs font-mono font-semibold text-cyber-50 leading-tight">{c.title}</h3>
                            <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 shrink-0 ml-2 status-${c.status}`}>
                                {c.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-mono text-soc-400 line-clamp-2 mb-3">
                            {c.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[9px] font-mono text-soc-600">
                                <span>{c.creator?.full_name}</span>
                                <span className="text-soc-700">//</span>
                                <span className="tabular-nums">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            {canDelete && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                                    className="text-[9px] font-mono text-soc-600 hover:text-threat-critical transition-colors">
                                    [DEL]
                                </button>
                            )}
                        </div>
                        {c.assignments?.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                                {c.assignments.map(a => (
                                    <span key={a.id} className="text-[8px] font-mono text-soc-500 bg-soc-800 border border-soc-700 px-1 py-0.5">
                                        {a.user?.full_name?.split(' ')[0]}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {cases.length === 0 && (
                <div className="text-center py-12 font-mono text-soc-600 text-xs">NO CASES FOUND</div>
            )}

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Initialize New Case">
                <CaseForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
            </Modal>
        </div>
    );
}
