/**
 * Login — SOC cyber terminal-style authentication screen.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/command-center');
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-soc-950 flex items-center justify-center relative overflow-hidden">
            {/* Background grid lines */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,255,159,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Auth Panel */}
            <div className="relative w-full max-w-sm mx-4 bg-soc-900 border border-soc-700 shadow-cyber-lg">
                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-400/60 to-transparent" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-soc-700">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-cyber-400 text-lg font-mono">◈</span>
                        <div>
                            <h1 className="text-sm font-mono font-bold text-cyber-400 tracking-[0.2em] uppercase">VAPOR SCAN</h1>
                            <p className="text-[9px] font-mono text-soc-500 tracking-widest uppercase">OSINT Intelligence Platform</p>
                        </div>
                    </div>
                    <p className="text-[10px] font-mono text-soc-500 mt-2">▸ SECURE AUTHENTICATION REQUIRED</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
                    {error && (
                        <div className="px-3 py-2 border border-threat-critical/30 bg-threat-critical/5 text-threat-critical text-[10px]">
                            [ERR] {error}
                        </div>
                    )}

                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1.5">Operator ID</label>
                        <input type="email" className="cyber-input" value={email} placeholder="agent@vaporscan.io"
                            onChange={(e) => setEmail(e.target.value)} required autoFocus />
                    </div>

                    <div>
                        <label className="text-[9px] text-soc-500 uppercase tracking-wider block mb-1.5">Access Key</label>
                        <input type="password" className="cyber-input" value={password} placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" disabled={loading}
                        className="cyber-btn w-full py-2.5 mt-2 disabled:opacity-50">
                        {loading ? '[ AUTHENTICATING... ]' : '[ ACCESS SYSTEM ]'}
                    </button>

                    <p className="text-center text-[10px] text-soc-600">
                        NEW OPERATOR? {' '}
                        <Link to="/register" className="text-cyber-400 hover:text-cyber-300 transition-colors">[REGISTER]</Link>
                    </p>
                </form>

                {/* Footer */}
                <div className="px-6 py-2 border-t border-soc-700">
                    <p className="text-[8px] font-mono text-soc-600 tracking-wider">
                        ◈ ENCRYPTED // AES-256 // PBKDF2-SHA256
                    </p>
                </div>
            </div>
        </div>
    );
}
