'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { DistrictFacilityNode } from '../services/DistrictMapData';
import { RefreshCcw } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 32 : 24;
  const shadow = isSelected ? '0 0 12px rgba(0,0,0,0.8)' : '0 0 4px rgba(0,0,0,0.4)';
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: ${shadow}; transition: all 0.3s ease;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapController = ({ 
  facilities, 
  selectedFacility,
  resetViewTrigger
}: { 
  facilities: DistrictFacilityNode[];
  selectedFacility: DistrictFacilityNode | null;
  resetViewTrigger: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (facilities.length > 0 && !selectedFacility) {
      const bounds = L.latLngBounds(facilities.map(f => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities, map, resetViewTrigger]);

  useEffect(() => {
    if (selectedFacility) {
      map.flyTo([selectedFacility.lat, selectedFacility.lng], 15, {
        duration: 1.5
      });
    }
  }, [selectedFacility, map]);

  return null;
};

export interface InteractiveFacilityMapProps {
  facilities: DistrictFacilityNode[];
  onFacilityClick: (facility: DistrictFacilityNode) => void;
  selectedFacility: DistrictFacilityNode | null;
}

export default function InteractiveFacilityMap({ facilities, onFacilityClick, selectedFacility }: InteractiveFacilityMapProps) {
  const [resetCount, setResetCount] = useState(0);

  if (facilities.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 font-medium">No healthcare facilities have been assigned to this district yet.</p>
      </div>
    );
  }

  const handleReset = () => {
    setResetCount(prev => prev + 1);
    onFacilityClick(null as any);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={[facilities[0].lat, facilities[0].lng]} 
        zoom={12} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <MapController 
          facilities={facilities} 
          selectedFacility={selectedFacility} 
          resetViewTrigger={resetCount}
        />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {facilities.map(fac => {
            const color = fac.type === 'hospital' ? '#3b82f6' : 
                          fac.status === 'green' ? '#10b981' : 
                          fac.status === 'yellow' ? '#f59e0b' : '#ef4444';
            
            const isSelected = selectedFacility?.id === fac.id;

            return (
              <Marker 
                key={fac.id} 
                position={[fac.lat, fac.lng]} 
                icon={createIcon(color, isSelected)}
                eventHandlers={{
                  click: () => onFacilityClick(fac)
                }}
              >
                {!isSelected && (
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="text-xs font-semibold">{fac.name}</div>
                  </Tooltip>
                )}
                <Popup autoPan={false}>
                  <div className="text-xs space-y-1.5 min-w-[150px]">
                    <div className="font-bold text-sm text-slate-800">{fac.name}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">{fac.type}</div>
                    <div className="pt-1 flex flex-col gap-1">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex justify-between">
                        <span>Beds:</span> <span className="font-bold">{fac.bedsOccupied}/{fac.bedsTotal}</span>
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex justify-between">
                        <span>Doctors:</span> <span className="font-bold">{fac.doctorsPresent}/{fac.doctorsTotal}</span>
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex justify-between">
                        <span>Stock:</span> <span className="font-bold truncate max-w-[80px]">{fac.medicineStock}</span>
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Reset Button */}
      <button 
        onClick={handleReset}
        className="absolute top-4 right-4 z-[400] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        title="Reset View"
      >
        <RefreshCcw className="h-5 w-5" />
      </button>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Facility Status</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white dark:border-slate-800 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">District Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] border border-white dark:border-slate-800 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white dark:border-slate-800 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white dark:border-slate-800 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
