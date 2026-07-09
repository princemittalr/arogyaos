'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StateDistrictNode } from '../services/StateMockData';
import { RefreshCcw } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 36 : 28;
  const shadow = isSelected ? '0 0 16px rgba(0,0,0,0.8)' : '0 0 8px rgba(0,0,0,0.4)';
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: ${shadow}; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapController = ({ 
  districts, 
  selectedDistrict,
  resetViewTrigger
}: { 
  districts: StateDistrictNode[];
  selectedDistrict: StateDistrictNode | null;
  resetViewTrigger: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (districts.length > 0 && !selectedDistrict) {
      const bounds = L.latLngBounds(districts.map(d => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts, map, resetViewTrigger]);

  useEffect(() => {
    if (selectedDistrict) {
      map.flyTo([selectedDistrict.lat, selectedDistrict.lng], 11, {
        duration: 1.5
      });
    }
  }, [selectedDistrict, map]);

  return null;
};

export interface InteractiveStateMapProps {
  districts: StateDistrictNode[];
  onDistrictClick: (district: StateDistrictNode) => void;
  selectedDistrict: StateDistrictNode | null;
}

export default function InteractiveStateMap({ districts, onDistrictClick, selectedDistrict }: InteractiveStateMapProps) {
  const [resetCount, setResetCount] = useState(0);

  if (districts.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 font-medium">No district data available for this state.</p>
      </div>
    );
  }

  const handleReset = () => {
    setResetCount(prev => prev + 1);
    onDistrictClick(null as any);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={[districts[0].lat, districts[0].lng]} 
        zoom={9} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <MapController 
          districts={districts} 
          selectedDistrict={selectedDistrict} 
          resetViewTrigger={resetCount}
        />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {districts.map(dist => {
          const color = dist.status === 'green' ? '#10b981' : 
                        dist.status === 'yellow' ? '#f59e0b' : '#ef4444';
          
          const isSelected = selectedDistrict?.id === dist.id;

          return (
            <Marker 
              key={dist.id} 
              position={[dist.lat, dist.lng]} 
              icon={createIcon(color, isSelected)}
              eventHandlers={{
                click: () => onDistrictClick(dist)
              }}
            >
              {!isSelected && (
                <Tooltip direction="top" offset={[0, -10]}>
                  <div className="text-xs font-semibold">{dist.name} District</div>
                </Tooltip>
              )}
            </Marker>
          );
        })}
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
        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">District Status</h4>
        <div className="space-y-1.5">
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
