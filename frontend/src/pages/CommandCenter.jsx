/**
 * CommandCenter — SOC Map-first command center.
 * Full-height map, control bar, terminal log, and intel panel.
 */

import { useState, useEffect } from 'react';
import useCaseStore from '../stores/caseStore';
import useMarkerStore from '../stores/markerStore';
import useAuthStore from '../stores/authStore';
import MapView from '../components/MapView';
import IntelPanel from '../components/IntelPanel';
import TerminalLog from '../components/TerminalLog';
import Modal from '../components/Modal';
import MarkerForm from '../components/MarkerForm';
import { useToast } from '../components/Toast';

export default function CommandCenter() {
    const { cases, fetchCases } = useCaseStore();
    const { markers, fetchMarkers, createMarker } = useMarkerStore();
    const { user } = useAuthStore();
    const toast = useToast();

    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [showMarkerForm, setShowMarkerForm] = useState(false);
    const [clickLatLng, setClickLatLng] = useState(null);
    const [showPanel, setShowPanel] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);

    useEffect(() => { fetchCases({ limit: 100 }); }, []);

    useEffect(() => {
        if (selectedCase) {
            fetchMarkers({ case_id: selectedCase.id, limit: 200 });
        } else if (cases.length > 0) {
            fetchMarkers({ limit: 200 });
        }
    }, [selectedCase, cases.length]);

    const handleCaseChange = (e) => {
        const v = e.target.value;
        setSelectedCase(v === '' ? null : cases.find(c => c.id === parseInt(v)));
        setSelectedMarker(null);
        setShowPanel(false);
    };

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setShowPanel(true);
    };

    const handleMapClick = (latlng) => {
        if (!selectedCase) { toast('Select a case first', 'warning'); return; }
        setClickLatLng(latlng);
        setShowMarkerForm(true);
    };

    const handleCreateMarker = async (data) => {
        const result = await createMarker(data);
        if (result) {
            setShowMarkerForm(false);
            setClickLatLng(null);
            toast('Marker deployed', 'success');
            if (selectedCase) fetchMarkers({ case_id: selectedCase.id, limit: 200 });
        }
    };

    const riskCounts = markers.reduce((acc, m) => {
        acc[m.risk_level] = (acc[m.risk_level] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex h-full w-full">
            {/* Center: Map area + controls + terminal */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {/* Control Bar */}
                <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-1.5 bg-soc-900 border-b border-soc-700 font-mono">
                    <div className="flex items-center gap-3">
                        <select value={selectedCase?.id || ''} onChange={handleCaseChange}
                            className="cyber-select min-w-[200px]">
                            <option value="">── ALL CASES ──</option>
                            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        {selectedCase && (
                            <span className={`text-[8px] uppercase px-1.5 py-0.5 status-${selectedCase.status}`}>
                                {selectedCase.status}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px]">
                        <div className="flex items-center gap-3">
                            <span className="text-soc-500">TGT:</span>
                            <span className="text-cyber-400 font-bold">{markers.length}</span>
                            {riskCounts.critical > 0 && <span className="text-threat-critical threat-pulse">CRIT:{riskCounts.critical}</span>}
                            {riskCounts.high > 0 && <span className="text-threat-high">HIGH:{riskCounts.high}</span>}
                            {riskCounts.medium > 0 && <span className="text-threat-medium">MED:{riskCounts.medium}</span>}
                        </div>
                        <button onClick={() => setShowTerminal(!showTerminal)}
                            className="text-[9px] font-mono text-soc-500 hover:text-cyber-400 transition-colors">
                            [{showTerminal ? 'HIDE' : 'SHOW'} LOG]
                        </button>
                        {selectedCase && (
                            <button onClick={() => { setClickLatLng(null); setShowMarkerForm(true); }}
                                className="cyber-btn py-1 px-2.5 text-[9px]">
                                [+ MARKER]
                            </button>
                        )}
                    </div>
                </div>

                {/* MAP — takes all remaining height */}
                <div className="flex-1 min-h-0 relative">
                    <MapView
                        markers={markers}
                        onMapClick={handleMapClick}
                        onMarkerClick={handleMarkerClick}
                        center={markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : undefined}
                        zoom={markers.length > 0 ? 12 : 3}
                    />
                </div>

                {/* Terminal Log — collapsible */}
                {showTerminal && (
                    <div className="h-40 shrink-0 border-t border-soc-700">
                        <TerminalLog caseId={selectedCase?.id} />
                    </div>
                )}
            </div>

            {/* Right: Intel Panel */}
            {showPanel && (
                <IntelPanel
                    marker={selectedMarker}
                    onClose={() => { setShowPanel(false); setSelectedMarker(null); }}
                    onRefresh={() => {
                        if (selectedCase) fetchMarkers({ case_id: selectedCase.id, limit: 200 });
                    }}
                />
            )}

            {/* Marker Form Modal */}
            <Modal isOpen={showMarkerForm} onClose={() => { setShowMarkerForm(false); setClickLatLng(null); }} title="Deploy Intelligence Marker">
                <MarkerForm
                    caseId={selectedCase?.id}
                    latLng={clickLatLng}
                    onSubmit={handleCreateMarker}
                    onCancel={() => { setShowMarkerForm(false); setClickLatLng(null); }}
                />
            </Modal>
        </div>
    );
}
