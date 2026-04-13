/**
 * MapView — SOC dark intelligence map with neon green markers,
 * glow effects, and pulsing animation for high-risk markers.
 *
 * Includes FixMap component to force invalidateSize() on mount
 * (required when Leaflet is inside flex layouts).
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── FixMap — forces Leaflet to recalculate size in flex containers ──
function FixMap() {
    const map = useMap();

    useEffect(() => {
        // Initial resize after mount
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // Also resize on window resize
        const handleResize = () => map.invalidateSize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [map]);

    return null;
}

// ── Neon marker icons by risk level ──
function createCyberMarkerIcon(riskLevel) {
    const colors = {
        low: { fill: '#00e676', glow: 'rgba(0,230,118,0.4)', ring: 'rgba(0,230,118,0.2)' },
        medium: { fill: '#ffd600', glow: 'rgba(255,214,0,0.4)', ring: 'rgba(255,214,0,0.2)' },
        high: { fill: '#ff6d00', glow: 'rgba(255,109,0,0.4)', ring: 'rgba(255,109,0,0.2)' },
        critical: { fill: '#ff1744', glow: 'rgba(255,23,68,0.5)', ring: 'rgba(255,23,68,0.3)' },
    };

    const c = colors[riskLevel] || colors.low;
    const isPulsing = riskLevel === 'critical' || riskLevel === 'high';

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="position:relative;width:20px;height:20px;">
        ${isPulsing ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${c.ring};animation:pulseGlow 2s ease-in-out infinite;"></div>` : ''}
        <div style="
          width:12px;height:12px;border-radius:50%;
          background:${c.fill};
          box-shadow:0 0 8px ${c.glow}, 0 0 16px ${c.glow};
          border:1px solid ${c.fill};
          position:absolute;top:4px;left:4px;
          transition:box-shadow 0.2s;
        "></div>
      </div>
    `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
    });
}

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) { onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng }); },
    });
    return null;
}

export default function MapView({ markers = [], onMapClick, onMarkerClick, center, zoom }) {
    const defaultCenter = [20, 0];
    const defaultZoom = 3;

    return (
        <MapContainer
            center={center || defaultCenter}
            zoom={zoom || defaultZoom}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', background: '#050805' }}
            zoomControl={true}
        >
            {/* FixMap — MUST be first child to force invalidateSize */}
            <FixMap />

            {/* Dark tiles — CartoDB Dark Matter (free, no API key) */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />

            <MapClickHandler onClick={onMapClick} />

            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={[marker.latitude, marker.longitude]}
                    icon={createCyberMarkerIcon(marker.risk_level)}
                    eventHandlers={{
                        click: () => onMarkerClick?.(marker),
                    }}
                >
                    <Popup>
                        <div className="font-mono text-xs space-y-1">
                            <p className="text-cyber-400 font-semibold">{marker.title}</p>
                            <p className="text-soc-300 text-[10px]">{marker.description?.slice(0, 80)}</p>
                            <div className="flex gap-2 text-[9px] mt-1">
                                <span className={`risk-${marker.risk_level} px-1 py-0.5`}>{marker.risk_level?.toUpperCase()}</span>
                                <span className="text-soc-500">{marker.category}</span>
                            </div>
                            <p className="text-[9px] text-soc-600 mt-1">
                                {marker.latitude?.toFixed(4)}, {marker.longitude?.toFixed(4)}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
