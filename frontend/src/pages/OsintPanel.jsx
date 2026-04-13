/**
 * OsintPanel — SOC-styled OSINT intelligence page.
 * IP Geolocation, Domain Lookup, Social Media Username Search.
 * Results can be plotted on an embedded map.
 */

import { useState } from 'react';
import client from '../api/client';
import MapView from '../components/MapView';
import { useToast } from '../components/Toast';

export default function OsintPanel() {
    const toast = useToast();
    const [activeModule, setActiveModule] = useState('ip');

    // IP state
    const [ipQuery, setIpQuery] = useState('');
    const [ipResult, setIpResult] = useState(null);
    const [ipLoading, setIpLoading] = useState(false);

    // Domain state
    const [domainQuery, setDomainQuery] = useState('');
    const [domainResult, setDomainResult] = useState(null);
    const [domainLoading, setDomainLoading] = useState(false);

    // Username state
    const [usernameQuery, setUsernameQuery] = useState('');
    const [usernameResult, setUsernameResult] = useState(null);
    const [usernameLoading, setUsernameLoading] = useState(false);

    // Map markers from OSINT results
    const [osintMarkers, setOsintMarkers] = useState([]);

    const lookupIP = async () => {
        if (!ipQuery.trim()) return;
        setIpLoading(true);
        setIpResult(null);
        try {
            const res = await client.get(`/osint/ip/${ipQuery.trim()}`);
            setIpResult(res.data);
            if (res.data.lat && res.data.lon) {
                const marker = {
                    id: `ip-${Date.now()}`,
                    title: `IP: ${res.data.ip}`,
                    description: `${res.data.city}, ${res.data.country} — ${res.data.isp}`,
                    latitude: res.data.lat,
                    longitude: res.data.lon,
                    risk_level: 'medium',
                    category: 'IP Geolocation',
                };
                setOsintMarkers(prev => [...prev, marker]);
                toast('IP plotted on map', 'success');
            }
        } catch (err) {
            toast(err.response?.data?.detail || 'IP lookup failed', 'error');
        }
        setIpLoading(false);
    };

    const lookupDomain = async () => {
        if (!domainQuery.trim()) return;
        setDomainLoading(true);
        setDomainResult(null);
        try {
            const res = await client.get(`/osint/domain/${domainQuery.trim()}`);
            setDomainResult(res.data);
            if (res.data.lat && res.data.lon) {
                const marker = {
                    id: `dom-${Date.now()}`,
                    title: `Domain: ${res.data.domain}`,
                    description: `${res.data.ip} — ${res.data.city}, ${res.data.country}`,
                    latitude: res.data.lat,
                    longitude: res.data.lon,
                    risk_level: 'low',
                    category: 'Domain Lookup',
                };
                setOsintMarkers(prev => [...prev, marker]);
                toast('Domain plotted on map', 'success');
            }
        } catch (err) {
            toast(err.response?.data?.detail || 'Domain lookup failed', 'error');
        }
        setDomainLoading(false);
    };

    const lookupUsername = async () => {
        if (!usernameQuery.trim()) return;
        setUsernameLoading(true);
        setUsernameResult(null);
        try {
            const res = await client.get(`/osint/username/${usernameQuery.trim()}`);
            setUsernameResult(res.data);
            toast(`Found on ${res.data.total_found} platforms`, 'info');
        } catch (err) {
            toast(err.response?.data?.detail || 'Username lookup failed', 'error');
        }
        setUsernameLoading(false);
    };

    const modules = [
        { key: 'ip', label: 'IP LOOKUP' },
        { key: 'domain', label: 'DOMAIN' },
        { key: 'username', label: 'USERNAME' },
    ];

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-cyber-400 font-mono text-xs">▸</span>
                    <h1 className="text-sm font-mono font-semibold text-cyber-400 uppercase tracking-wider">OSINT Intelligence</h1>
                </div>

                {/* Module tabs */}
                <div className="flex gap-0 border-b border-soc-700">
                    {modules.map(m => (
                        <button key={m.key} onClick={() => setActiveModule(m.key)}
                            className={`px-4 py-1.5 text-[10px] font-mono tracking-wider transition-colors ${activeModule === m.key
                                    ? 'text-cyber-400 border-b border-cyber-400 bg-cyber-400/5'
                                    : 'text-soc-500 hover:text-soc-300'
                                }`}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex">
                {/* Left: Input + Results */}
                <div className="w-96 shrink-0 border-r border-soc-700 overflow-y-auto p-4 space-y-3">

                    {/* ── IP LOOKUP ────────────────── */}
                    {activeModule === 'ip' && (
                        <>
                            <div className="flex gap-2">
                                <input className="cyber-input flex-1" value={ipQuery} placeholder="Enter IP address..."
                                    onChange={(e) => setIpQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lookupIP()} />
                                <button onClick={lookupIP} disabled={ipLoading} className="cyber-btn text-[10px] px-3 disabled:opacity-50">
                                    {ipLoading ? '[...]' : '[SCAN]'}
                                </button>
                            </div>

                            {ipResult && (
                                <div className="soc-panel p-3 font-mono text-[10px] space-y-1.5 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-cyber-400">▸</span>
                                        <span className="text-cyber-400 font-semibold uppercase text-[11px]">IP Intelligence</span>
                                    </div>
                                    <Row label="IP" value={ipResult.ip} />
                                    <Row label="Country" value={`${ipResult.country} (${ipResult.country_code})`} />
                                    <Row label="Region" value={ipResult.region} />
                                    <Row label="City" value={ipResult.city} />
                                    <Row label="ZIP" value={ipResult.zip} />
                                    <Row label="Lat/Lon" value={`${ipResult.lat}, ${ipResult.lon}`} highlight />
                                    <Row label="Timezone" value={ipResult.timezone} />
                                    <Row label="ISP" value={ipResult.isp} />
                                    <Row label="Org" value={ipResult.org} />
                                    <Row label="AS" value={ipResult.as_number} />
                                </div>
                            )}
                        </>
                    )}

                    {/* ── DOMAIN LOOKUP ────────────── */}
                    {activeModule === 'domain' && (
                        <>
                            <div className="flex gap-2">
                                <input className="cyber-input flex-1" value={domainQuery} placeholder="Enter domain..."
                                    onChange={(e) => setDomainQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lookupDomain()} />
                                <button onClick={lookupDomain} disabled={domainLoading} className="cyber-btn text-[10px] px-3 disabled:opacity-50">
                                    {domainLoading ? '[...]' : '[RESOLVE]'}
                                </button>
                            </div>

                            {domainResult && (
                                <div className="soc-panel p-3 font-mono text-[10px] space-y-1.5 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-cyber-400">▸</span>
                                        <span className="text-cyber-400 font-semibold uppercase text-[11px]">Domain Intelligence</span>
                                    </div>
                                    <Row label="Domain" value={domainResult.domain} />
                                    <Row label="IP" value={domainResult.ip} highlight />
                                    <Row label="Country" value={domainResult.country} />
                                    <Row label="City" value={domainResult.city} />
                                    <Row label="Lat/Lon" value={`${domainResult.lat}, ${domainResult.lon}`} highlight />
                                    <Row label="ISP" value={domainResult.isp} />
                                    <Row label="Org" value={domainResult.org} />
                                </div>
                            )}
                        </>
                    )}

                    {/* ── USERNAME LOOKUP ──────────── */}
                    {activeModule === 'username' && (
                        <>
                            <div className="flex gap-2">
                                <input className="cyber-input flex-1" value={usernameQuery} placeholder="Enter username..."
                                    onChange={(e) => setUsernameQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lookupUsername()} />
                                <button onClick={lookupUsername} disabled={usernameLoading} className="cyber-btn text-[10px] px-3 disabled:opacity-50">
                                    {usernameLoading ? '[...]' : '[TRACE]'}
                                </button>
                            </div>

                            {usernameResult && (
                                <div className="soc-panel p-3 font-mono text-[10px] space-y-2 animate-fade-in">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-cyber-400">▸</span>
                                            <span className="text-cyber-400 font-semibold uppercase text-[11px]">Username: {usernameResult.username}</span>
                                        </div>
                                        <span className="text-cyber-400 bg-cyber-400/10 border border-cyber-400/20 px-1.5 py-0.5 text-[9px]">
                                            {usernameResult.total_found} FOUND
                                        </span>
                                    </div>

                                    {usernameResult.results.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between py-1 border-b border-soc-700/30 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${r.exists ? 'bg-cyber-400' : 'bg-soc-600'}`} />
                                                <span className={r.exists ? 'text-cyber-50' : 'text-soc-600'}>{r.platform}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] uppercase px-1 py-0.5 ${r.exists ? 'evidence-approved' : 'text-soc-600 bg-soc-800 border border-soc-700'
                                                    }`}>
                                                    {r.exists ? 'FOUND' : 'N/A'}
                                                </span>
                                                {r.exists && (
                                                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-cyber-400/60 hover:text-cyber-400 transition-colors text-[9px]">
                                                        [OPEN]
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right: OSINT Map */}
                <div className="flex-1 min-h-0 min-w-0 relative">
                    <MapView
                        markers={osintMarkers}
                        onMarkerClick={() => { }}
                        center={osintMarkers.length > 0 ? [osintMarkers[osintMarkers.length - 1].latitude, osintMarkers[osintMarkers.length - 1].longitude] : undefined}
                        zoom={osintMarkers.length > 0 ? 8 : 3}
                    />
                    {/* Map overlay: marker count */}
                    <div className="absolute top-3 right-3 z-[1000] soc-panel px-2 py-1 text-[9px] font-mono text-cyber-400">
                        OSINT MARKERS: {osintMarkers.length}
                    </div>
                    {osintMarkers.length > 0 && (
                        <button onClick={() => setOsintMarkers([])}
                            className="absolute bottom-3 right-3 z-[1000] cyber-btn-danger text-[9px] px-2 py-1">
                            [CLEAR MAP]
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Reusable data row for OSINT results */
function Row({ label, value, highlight }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-soc-600 w-16 shrink-0 uppercase">{label}</span>
            <span className={highlight ? 'text-cyber-400' : 'text-cyber-50/80'}>{value || '—'}</span>
        </div>
    );
}
