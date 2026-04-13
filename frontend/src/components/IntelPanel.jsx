/**
 * IntelPanel — SOC-style right-side intelligence panel.
 * Shows marker details, evidence list (with approval status/actions), and timeline.
 */

import { useState, useEffect } from 'react';
import client from '../api/client';
import useAuthStore from '../stores/authStore';
import EvidenceUpload from './EvidenceUpload';
import { useToast } from './Toast';

export default function IntelPanel({ marker, onClose, onRefresh }) {
    const { user } = useAuthStore();
    const toast = useToast();
    const [evidence, setEvidence] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [activeTab, setActiveTab] = useState('details');

    const canApprove = ['admin', 'manager'].includes(user?.role);

    useEffect(() => {
        if (marker) { fetchEvidence(); fetchTimeline(); }
    }, [marker?.id]);

    const fetchEvidence = async () => {
        if (!marker) return;
        try {
            const res = await client.get(`/evidence/marker/${marker.id}`);
            setEvidence(res.data.items);
        } catch { /* silent */ }
    };

    const fetchTimeline = async () => {
        if (!marker?.case_id) return;
        try {
            const res = await client.get(`/timeline/${marker.case_id}`, { params: { limit: 25 } });
            setTimeline(res.data.items);
        } catch { /* silent */ }
    };

    const handleApprove = async (id) => {
        try {
            await client.put(`/evidence/${id}/approve`);
            toast('Evidence approved', 'success');
            fetchEvidence();
        } catch (err) { toast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    const handleReject = async (id) => {
        try {
            await client.put(`/evidence/${id}/reject`);
            toast('Evidence rejected', 'warning');
            fetchEvidence();
        } catch (err) { toast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    if (!marker) return null;

    const tabs = [
        { key: 'details', label: 'INTEL' },
        { key: 'evidence', label: `EVID [${evidence.length}]` },
        { key: 'timeline', label: 'LOG' },
    ];

    const actionIcons = {
        marker_added: '◉', marker_updated: '◎', marker_deleted: '◇',
        evidence_uploaded: '▸', evidence_approved: '✓', evidence_rejected: '✗',
        status_changed: '⟳', user_assigned: '◈', case_created: '◆',
        note_added: '▪', report_generated: '▫',
    };

    return (
        <div className="w-80 h-full bg-soc-900 border-l border-soc-700 flex flex-col animate-slide-in overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-400/30 to-transparent" />

            {/* Header */}
            <div className="px-3 py-2 border-b border-soc-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-cyber-400 text-[10px]">▸</span>
                    <h3 className="text-[10px] font-mono font-semibold text-cyber-400 uppercase tracking-wider">Intel Panel</h3>
                </div>
                <button onClick={onClose} className="text-soc-500 hover:text-threat-critical transition-colors font-mono text-[10px]">
                    [×]
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-soc-700">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider transition-colors ${activeTab === tab.key
                                ? 'text-cyber-400 border-b border-cyber-400 bg-cyber-400/5'
                                : 'text-soc-500 hover:text-soc-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* ── Details Tab ──────────────────── */}
                {activeTab === 'details' && (
                    <div className="p-3 space-y-3 font-mono">
                        <div>
                            <p className="text-[9px] text-soc-500 uppercase tracking-wider">Target</p>
                            <h4 className="text-sm text-cyber-50 font-semibold mt-0.5">{marker.title}</h4>
                            <p className="text-[10px] text-soc-400 mt-1">{marker.description || 'No description'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="soc-panel p-2">
                                <p className="text-[8px] text-soc-600 uppercase">Risk Level</p>
                                <span className={`text-[10px] uppercase px-1.5 py-0.5 inline-block mt-0.5 risk-${marker.risk_level}`}>
                                    {marker.risk_level}
                                </span>
                            </div>
                            <div className="soc-panel p-2">
                                <p className="text-[8px] text-soc-600 uppercase">Category</p>
                                <p className="text-[10px] text-cyber-50 mt-0.5">{marker.category || '—'}</p>
                            </div>
                        </div>

                        <div className="soc-panel p-2">
                            <p className="text-[8px] text-soc-600 uppercase">Coordinates</p>
                            <p className="text-[10px] text-cyber-400 mt-0.5">
                                {marker.latitude?.toFixed(6)}, {marker.longitude?.toFixed(6)}
                            </p>
                        </div>

                        <div className="soc-panel p-2">
                            <p className="text-[8px] text-soc-600 uppercase">Created</p>
                            <p className="text-[10px] text-soc-400 mt-0.5">
                                {new Date(marker.created_at).toISOString().replace('T', ' ').slice(0, 19)} UTC
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Evidence Tab ─────────────────── */}
                {activeTab === 'evidence' && (
                    <div className="p-3 space-y-2 font-mono">
                        <EvidenceUpload markerId={marker.id} onUploadComplete={fetchEvidence} />
                        {evidence.length === 0 ? (
                            <p className="text-soc-600 text-[10px] text-center py-4">NO EVIDENCE RECORDS</p>
                        ) : (
                            evidence.map(e => (
                                <div key={e.id} className="soc-panel p-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-cyber-50 truncate">{e.original_filename}</p>
                                            <p className="text-[9px] text-soc-600 mt-0.5">
                                                {e.uploader?.full_name} // {new Date(e.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`text-[8px] uppercase px-1.5 py-0.5 evidence-${e.status}`}>
                                            {e.status}
                                        </span>
                                    </div>
                                    {canApprove && e.status === 'pending' && (
                                        <div className="flex gap-1.5 mt-2">
                                            <button onClick={() => handleApprove(e.id)}
                                                className="flex-1 py-1 text-[9px] uppercase tracking-wider border border-cyber-400/30 text-cyber-400 hover:bg-cyber-400/10 transition-colors">
                                                [APPROVE]
                                            </button>
                                            <button onClick={() => handleReject(e.id)}
                                                className="flex-1 py-1 text-[9px] uppercase tracking-wider border border-threat-critical/30 text-threat-critical hover:bg-threat-critical/10 transition-colors">
                                                [REJECT]
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Timeline Tab ─────────────────── */}
                {activeTab === 'timeline' && (
                    <div className="p-3 font-mono">
                        {timeline.length === 0 ? (
                            <p className="text-soc-600 text-[10px] text-center py-4">NO ACTIVITY LOGGED</p>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-[7px] top-0 bottom-0 w-px bg-soc-700" />
                                <div className="space-y-2.5">
                                    {timeline.map(event => (
                                        <div key={event.id} className="flex gap-2.5 relative">
                                            <div className="w-4 h-4 rounded-sm bg-soc-900 border border-soc-700 flex items-center justify-center text-[8px] text-cyber-400 z-10 shrink-0 mt-0.5">
                                                {actionIcons[event.action_type] || '•'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-cyber-50/80">{event.description}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] text-soc-600">{event.user?.full_name}</span>
                                                    <span className="text-[9px] text-soc-700">//</span>
                                                    <span className="text-[9px] text-soc-600 tabular-nums">
                                                        {new Date(event.created_at).toISOString().slice(0, 16).replace('T', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
