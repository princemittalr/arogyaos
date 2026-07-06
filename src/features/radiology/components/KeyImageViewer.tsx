'use client';

import React, { useState } from 'react';
import { KeyImageSlice } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface KeyImageViewerProps {
  slices: KeyImageSlice[];
}

export function KeyImageViewer({ slices }: KeyImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!slices || slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
        <Info className="h-6 w-6 mb-2 text-slate-600" />
        <span>No diagnostic key image slices uploaded for this study.</span>
      </div>
    );
  }

  const activeSlice = slices[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slices.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slices.length) % slices.length);
  };

  return (
    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Top Bar / Metadata Overlay */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 border-b border-slate-900 pb-2 shrink-0">
        <div>
          <span className="text-emerald-500 font-bold">KEY SLICE {activeIndex + 1}/{slices.length}</span>
          <span className="mx-2 text-slate-600">|</span>
          <span>SOP: ...{activeSlice.sopInstanceUid.slice(-8)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setZoom(!zoom)}
            className="hover:text-slate-100 flex items-center gap-1 transition"
          >
            <ZoomIn className="h-3 w-3" />
            <span>{zoom ? '100%' : 'Fit'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full aspect-square max-h-[360px] bg-black flex items-center justify-center rounded-xl overflow-hidden group">
        <img
          src={activeSlice.thumbnailUrl}
          alt={activeSlice.description || `Slice ${activeSlice.instanceNumber}`}
          className={cn(
            "w-full h-full object-cover transition duration-300",
            zoom ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          )}
          onClick={() => setZoom(!zoom)}
        />

        {/* Orientation Indicators */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 font-bold bg-black/40 px-1.5 py-0.5 rounded">S</div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 font-bold bg-black/40 px-1.5 py-0.5 rounded">I</div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold bg-black/40 px-1.5 py-0.5 rounded">R</div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold bg-black/40 px-1.5 py-0.5 rounded">L</div>

        {/* Technical Stats Overlay (Simulated DICOM overlay) */}
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg leading-relaxed border border-slate-900">
          <p className="font-extrabold text-slate-200">AROGYA OS MEDICAL VIEWER</p>
          <p>Series: {activeSlice.seriesInstanceUid.substring(0, 12)}...</p>
          <p>Instance: #{activeSlice.instanceNumber}</p>
          <p>W: 400 L: 40</p>
        </div>

        {/* Navigation Arrows */}
        {slices.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 hover:bg-slate-900 text-slate-350 rounded-xl transition border border-slate-800 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 hover:bg-slate-900 text-slate-350 rounded-xl transition border border-slate-800 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Description caption */}
      {activeSlice.description && (
        <div className="mt-3 text-center text-xs font-semibold text-slate-400 font-sans italic w-full">
          &ldquo;{activeSlice.description}&rdquo;
        </div>
      )}

      {/* Slice Carousel dots */}
      {slices.length > 1 && (
        <div className="flex gap-1.5 justify-center mt-3 w-full overflow-x-auto py-1.5">
          {slices.map((slice, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all shrink-0",
                activeIndex === idx ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-800 hover:bg-slate-700"
              )}
            />
          ))}
        </div>
      )}

    </div>
  );
}
