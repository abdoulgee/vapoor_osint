/**
 * CaseForm — SOC-styled case creation/edit form.
 */

import { useState } from 'react';

export default function CaseForm({ initialData, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'open',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
            <div>
                <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Case Title</label>
                <input className="cyber-input" value={form.title} placeholder="Operation name..."
                    onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
                <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea className="cyber-input min-h-[80px] resize-none" value={form.description} placeholder="Investigation details..."
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
                <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1">Status</label>
                <select className="cyber-select w-full" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="open">OPEN</option>
                    <option value="investigating">INVESTIGATING</option>
                    <option value="closed">CLOSED</option>
                </select>
            </div>
            <div className="flex gap-2 pt-2">
                <button type="submit" className="cyber-btn flex-1">[CONFIRM]</button>
                {onCancel && <button type="button" onClick={onCancel} className="cyber-btn-danger flex-1">[CANCEL]</button>}
            </div>
        </form>
    );
}
