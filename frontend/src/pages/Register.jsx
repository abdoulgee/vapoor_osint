/**
 * Register — SOC cyber terminal-style registration screen.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form.email, form.password, form.full_name);
            navigate('/command-center');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-soc-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,255,159,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative w-full max-w-sm mx-4 bg-soc-900 border border-soc-700 shadow-cyber-lg">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-400/60 to-transparent" />

                <div className="px-6 pt-6 pb-4 border-b border-soc-700">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-cyber-400 text-lg font-mono">◈</span>
                        <div>
                            <h1 className="text-sm font-mono font-bold text-cyber-400 tracking-[0.2em] uppercase">VAPOR SCAN</h1>
                            <p className="text-[9px] font-mono text-soc-500 tracking-widest uppercase">Operator Registration</p>
                        </div>
                    </div>
                    <p className="text-[10px] font-mono text-soc-500 mt-2">▸ NEW OPERATOR ENROLLMENT</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
                    {error && (
                        <div className="px-3 py-2 border border-threat-critical/30 bg-threat-critical/5 text-threat-critical text-[10px]">
                            [ERR] {error}
                        </div>
                    )}

                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1.5">Callsign</label>
                        <input className="cyber-input" value={form.full_name} placeholder="Full name..."
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })} required autoFocus />
                    </div>

                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1.5">Operator ID</label>
                        <input type="email" className="cyber-input" value={form.email} placeholder="agent@vaporscan.io"
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>

                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1.5">Access Key</label>
                        <input type="password" className="cyber-input" value={form.password} placeholder="Min 6 characters"
                            onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    </div>

                    <button type="submit" disabled={loading} className="cyber-btn w-full py-2.5 mt-2 disabled:opacity-50">
                        {loading ? '[ PROCESSING... ]' : '[ ENROLL OPERATOR ]'}
                    </button>

                    <p className="text-center text-[10px] text-soc-600">
                        EXISTING OPERATOR? {' '}
                        <Link to="/login" className="text-cyber-400 hover:text-cyber-300 transition-colors">[LOGIN]</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
