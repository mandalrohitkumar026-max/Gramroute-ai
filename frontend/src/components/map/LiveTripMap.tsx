import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StopData } from '../../services/trackingService';

interface LiveTripMapProps {
  stops: StopData[];
  vehicleLocation?: {
    latitude: number;
    longitude: number;
    speedKmh?: number;
    updatedAt?: string;
  } | null;
  height?: string;
}

// Custom Leaflet DivIcon Generators using standard SVG
const createCustomIcon = (type: 'PICKUP' | 'DROP' | 'VEHICLE' | 'COMPLETED') => {
  let bg = '#16a34a';
  let innerSvg = '';

  if (type === 'PICKUP') {
    bg = '#16a34a'; // Emerald
    innerSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  } else if (type === 'DROP') {
    bg = '#dc2626'; // Red
    innerSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;
  } else if (type === 'COMPLETED') {
    bg = '#64748b'; // Slate
    innerSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else {
    // Live Vehicle Marker
    bg = '#1b4d3e'; // Forest Primary
    innerSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;
  }

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      ${type === 'VEHICLE' ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(27,77,62,0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
      <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bg}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; z-index: 10;">
        ${innerSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Auto-Fit Bounds Component
const BoundsFitter: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [coordinates, map]);

  return null;
};

export const LiveTripMap: React.FC<LiveTripMapProps> = ({
  stops,
  vehicleLocation,
  height = '460px'
}) => {
  // Extract coordinates for Polyline & Bounds: [lat, lng]
  const validStopCoords: [number, number][] = stops
    .filter(s => s.location && s.location.coordinates && s.location.coordinates.length === 2)
    .map(s => [s.location.coordinates[1], s.location.coordinates[0]]);

  const allCoords = [...validStopCoords];
  if (vehicleLocation) {
    allCoords.push([vehicleLocation.latitude, vehicleLocation.longitude]);
  }

  const defaultCenter: [number, number] = allCoords.length > 0
    ? allCoords[0]
    : [19.9975, 73.7898]; // Default: Nashik

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline connecting waypoints */}
        {validStopCoords.length > 1 && (
          <Polyline
            positions={validStopCoords}
            color="#1b4d3e"
            weight={4}
            opacity={0.85}
            dashArray="6, 8"
          />
        )}

        {/* Stop Markers */}
        {stops.map((stop) => {
          const lat = stop.location.coordinates[1];
          const lon = stop.location.coordinates[0];
          const isDone = stop.status === 'COMPLETED';
          const iconType = isDone ? 'COMPLETED' : (stop.stopType === 'PICKUP' ? 'PICKUP' : 'DROP');

          return (
            <Marker
              key={stop._id}
              position={[lat, lon]}
              icon={createCustomIcon(iconType)}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-navy-900 flex items-center justify-between gap-2">
                    <span>Stop #{stop.stopSequenceOrder}: {stop.stopType}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isDone ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                  <div className="text-navy-600 font-medium">{stop.locationName}</div>
                  <div className="text-navy-400 text-[11px]">{stop.address}</div>
                  {stop.proofImageUrl && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold text-emerald-800 block">Proof of Delivery (POD):</span>
                      <img src={stop.proofImageUrl} alt="POD" className="w-full h-20 object-cover rounded mt-1 border" />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Vehicle Marker */}
        {vehicleLocation && (
          <Marker
            position={[vehicleLocation.latitude, vehicleLocation.longitude]}
            icon={createCustomIcon('VEHICLE')}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <div className="font-bold text-forest-primary text-sm flex items-center gap-1">
                  🚛 Active Truck in Transit
                </div>
                <div className="text-navy-700 font-medium">
                  Speed: <span className="font-bold text-navy-900">{vehicleLocation.speedKmh || 40} km/h</span>
                </div>
                <div className="text-[10px] text-navy-400">
                  Last GPS Ping: {vehicleLocation.updatedAt ? new Date(vehicleLocation.updatedAt).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <BoundsFitter coordinates={allCoords} />
      </MapContainer>
    </div>
  );
};
