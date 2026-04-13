/**
 * CaseDetail — SOC-styled case detail with tabbed map/evidence/FOI view.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCaseStore from '../stores/caseStore';
import useMarkerStore from '../stores/markerStore';
import useAuthStore from '../stores/authStore';
import MapView from '../components/MapView';
import IntelPanel from '../components/IntelPanel';
import TerminalLog from '../components/TerminalLog';
import Modal from '../components/Modal';
import MarkerForm from '../components/MarkerForm';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function CaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchCaseById, currentCase } = useCaseStore();
    const { markers, fetchMarkers, createMarker } = useMarkerStore();
    const { user } = useAuthStore();
    const toast = useToast();

    const [selectedMarker, setSelectedMarker] = useState(null);
    const [showPanel, setShowPanel] = useState(false);
    const [showMarkerForm, setShowMarkerForm] = useState(false);
    const [clickLatLng, setClickLatLng] = useState(null);
    const [activeTab, setActiveTab] = useState('map');
    const [foiRequests, setFoiRequests] = useState([]);

    useEffect(() => {
        fetchCaseById(id);
        fetchMarkers({ case_id: id, limit: 200 });
        fetchFOI();
    }, [id]);

    const fetchFOI = async () => {
        try {
            const res = await client.get(`/foi/?case_id=${id}`);
            setFoiRequests(res.data.items || []);
        } catch { /* silent */ }
    };

    const handleCreateMarker = async (data) => {
        const result = await createMarker(data);
        if (result) {
            setShowMarkerForm(false);
            setClickLatLng(null);
            toast('Marker deployed', 'success');
            fetchMarkers({ case_id: id, limit: 200 });
        }
    };

    if (!currentCase) {
        return (
            <div className="flex items-center justify-center h-64 font-mono text-cyber-400 text-xs">
                <span className="animate-pulse">LOADING CASE DATA...</span>
            </div>
        );
    }

    const tabs = [
        { key: 'map', label: 'MAP' },
        { key: 'evidence', label: 'EVIDENCE' },
        { key: 'foi', label: 'FOI LOG' },
        { key: 'timeline', label: 'TIMELINE' },
    ];

    return (
        <div className="space-y-3 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/cases')} className="text-soc-500 hover:text-cyber-400 font-mono text-xs transition-colors">
                        [← BACK]
                    </button>
                    <span className="text-soc-700 font-mono">│</span>
                    <h1 className="text-sm font-mono font-semibold text-cyber-50">{currentCase.title}</h1>
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 status-${currentCase.status}`}>
                        {currentCase.status}
                    </span>
                </div>
                <button onClick={() => setShowMarkerForm(true)} className="cyber-btn text-[10px] py-1.5 px-3">
                    [+ MARKER]
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0 border-b border-soc-700">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-1.5 text-[10px] font-mono tracking-wider transition-colors ${activeTab === tab.key
                                ? 'text-cyber-400 border-b border-cyber-400 bg-cyber-400/5'
                                : 'text-soc-500 hover:text-soc-300'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'map' && (
                <div className="flex" style={{ height: 'calc(100vh - 12rem)' }}>
                    <div className="flex-1 border border-soc-700">
                        <MapView
                            markers={markers}
                            onMapClick={(latlng) => { setClickLatLng(latlng); setShowMarkerForm(true); }}
                            onMarkerClick={(m) => { setSelectedMarker(m); setShowPanel(true); }}
                            center={markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : undefined}
                            zoom={12}
                        />
                    </div>
                    {showPanel && (
                        <IntelPanel marker={selectedMarker}
                            onClose={() => { setShowPanel(false); setSelectedMarker(null); }}
                            onRefresh={() => fetchMarkers({ case_id: id, limit: 200 })}
                        />
                    )}
                </div>
            )}

            {activeTab === 'evidence' && (
                <div className="space-y-2">
                    {markers.map(m => (
                        <div key={m.id} className="soc-panel p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full bg-${m.risk_level === 'critical' ? 'threat-critical' : m.risk_level === 'high' ? 'threat-high' : 'cyber-400'}`} />
                                <span className="text-xs font-mono text-cyber-50">{m.title}</span>
                                <span className="text-[9px] font-mono text-soc-600">({m.evidence_count || 0} files)</span>
                            </div>
                        </div>
                    ))}
                    {markers.length === 0 && (
                        <p className="text-center text-soc-600 font-mono text-xs py-8">NO MARKERS — ADD MARKERS TO ATTACH EVIDENCE</p>
                    )}
                </div>
            )}

            {activeTab === 'foi' && (
                <div className="space-y-2">
                    {foiRequests.map(f => (
                        <div key={f.id} className="soc-panel p-3 font-mono">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-cyber-50">{f.agency_name}</span>
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 ${f.response_status === 'completed' ? 'evidence-approved' : f.response_status === 'pending' ? 'evidence-pending' : 'status-investigating'
                                    }`}>{f.response_status}</span>
                            </div>
                            <p className="text-[10px] text-soc-400 mt-1">{f.notes}</p>
                            <p className="text-[9px] text-soc-600 mt-1">Requested: {f.request_date}</p>
                        </div>
                    ))}
                    {foiRequests.length === 0 && (
                        <p className="text-center text-soc-600 font-mono text-xs py-8">NO FOI REQUESTS</p>
                    )}
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="soc-panel" style={{ height: 'calc(100vh - 14rem)' }}>
                    <TerminalLog caseId={parseInt(id)} maxLines={50} />
                </div>
            )}

            <Modal isOpen={showMarkerForm} onClose={() => { setShowMarkerForm(false); setClickLatLng(null); }} title="Deploy Intel Marker">
                <MarkerForm caseId={parseInt(id)} latLng={clickLatLng}
                    onSubmit={handleCreateMarker}
                    onCancel={() => { setShowMarkerForm(false); setClickLatLng(null); }} />
            </Modal>
        </div>
    );
}
