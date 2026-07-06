import React from 'react';
import { Download, Printer, Archive, RotateCcw, X } from 'lucide-react';


interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onExport: () => void;
  onPrint: () => void;
  onArchive: () => void;
  onRestore: () => void;
  showRestore?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClear,
  onExport,
  onPrint,
  onArchive,
  onRestore,
  showRestore = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-6 z-40 border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center space-x-2 border-r border-slate-800 pr-4">
        <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full h-5.5 w-5.5 text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-300">selected</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition-colors"
          title="Download as ZIP"
        >
          <Download className="h-4 w-4" />
          <span>Export ZIP</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 transition-colors"
          title="Print Summary"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </button>

        {showRestore ? (
          <button
            type="button"
            onClick={onRestore}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-green-400 hover:text-green-300 transition-colors"
            title="Restore from archive"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restore</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onArchive}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
            title="Move to archive"
          >
            <Archive className="h-4 w-4" />
            <span>Archive</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BulkActionsBar;
