/**
 * MarkerForm — SOC-styled marker creation/edit form.
 */

import { useState } from 'react';

export default function MarkerForm({ caseId, latLng, initialData, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        case_id: initialData?.case_id || caseId || '',
        title: initialData?.title || '',
        description: initialData?.description || '',
        latitude: initialData?.latitude || latLng?.lat || '',
        longitude: initialData?.longitude || latLng?.lng || '',
        category: initialData?.category || '',
        risk_level: initialData?.risk_level || 'low',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
            <div>
                <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Target Name</label>
                <input className="cyber-input" value={form.title} placeholder="Marker identifier..."
                    onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
                <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Intel Notes</label>
                <textarea className="cyber-input min-h-[60px] resize-none" value={form.description} placeholder="Description..."
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">LAT</label>
                    <input type="number" step="any" className="cyber-input" value={form.latitude}
                        onChange={(e) => setForm({ ...form, latitude: e.target.value })} required />
                </div>
                <div>
                    <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">LNG</label>
                    <input type="number" step="any" className="cyber-input" value={form.longitude}
                        onChange={(e) => setForm({ ...form, longitude: e.target.value })} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Category</label>
                    <input className="cyber-input" value={form.category} placeholder="Type..."
                        onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                    <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Risk Level</label>
                    <select className="cyber-select w-full" value={form.risk_level}
                        onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                        <option value="low">LOW</option>
                        <option value="medium">MEDIUM</option>
                        <option value="high">HIGH</option>
                        <option value="critical">CRITICAL</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <button type="submit" className="cyber-btn flex-1">[DEPLOY MARKER]</button>
                {onCancel && <button type="button" onClick={onCancel} className="cyber-btn-danger flex-1">[ABORT]</button>}
            </div>
        </form>
    );
}
