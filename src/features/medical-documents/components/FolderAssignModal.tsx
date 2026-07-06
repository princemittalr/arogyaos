import React, { useState, useEffect, useRef } from 'react';
import { X, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface FolderAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderType[];
  selectedFolderId: string | null;
  onSave: (folderId: string | null) => void;
}

export const FolderAssignModal: React.FC<FolderAssignModalProps> = ({
  isOpen,
  onClose,
  folders,
  selectedFolderId,
  onSave,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state
  useEffect(() => {
    if (isOpen) {
      setCurrentFolderId(selectedFolderId);
    }
  }, [isOpen, selectedFolderId]);

  // Trap focus & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstEl = focusableElements[0] as HTMLElement;
        const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-assign-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 id="folder-assign-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
            Move Document to Folder
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Select Destination Folder
          </span>
          <div className="space-y-1.5">
            {/* Root folder choice */}
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={`w-full flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentFolderId === null
                  ? 'border-blue-500 bg-blue-50/20 text-blue-700 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Folder className="h-5 w-5 mr-3 text-slate-400 shrink-0" />
              <span>None (Move to Root)</span>
            </button>

            {/* Existing folders */}
            {folders.map((f) => (
              <button
                key={f.folderId}
                type="button"
                onClick={() => setCurrentFolderId(f.folderId)}
                className={`w-full flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  currentFolderId === f.folderId
                    ? 'border-blue-500 bg-blue-50/20 text-blue-700 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Folder className="h-5 w-5 mr-3 text-blue-500 shrink-0" />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(currentFolderId)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Move Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderAssignModal;
