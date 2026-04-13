/**
 * EvidenceUpload — SOC-styled file upload with drag-and-drop.
 */

import { useState, useRef } from 'react';
import client from '../api/client';
import { useToast } from './Toast';

export default function EvidenceUpload({ markerId, onUploadComplete }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const toast = useToast();

    const handleUpload = async (file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowed.includes(file.type)) {
            toast('Invalid file type. Allowed: JPG, PNG, GIF, WEBP, PDF', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await client.post(`/evidence/${markerId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast('Evidence uploaded — pending review', 'success');
            onUploadComplete?.();
        } catch (err) {
            toast(err.response?.data?.detail || 'Upload failed', 'error');
        }
        setUploading(false);
    };

    return (
        <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
            className={`soc-panel p-3 cursor-pointer text-center transition-colors ${dragging ? 'border-cyber-400 bg-cyber-400/5' : 'hover:border-soc-600'
                }`}
        >
            <input type="file" ref={fileRef} className="hidden" accept="image/*,.pdf"
                onChange={(e) => handleUpload(e.target.files[0])} />
            {uploading ? (
                <span className="text-[10px] font-mono text-cyber-400 animate-pulse">UPLOADING...</span>
            ) : (
                <span className="text-[10px] font-mono text-soc-500">[CLICK OR DROP] — ADD EVIDENCE</span>
            )}
        </div>
    );
}
