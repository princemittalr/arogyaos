import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Tag } from '../types';

interface TagAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: Tag[];
  selectedTagIds: string[];
  onSave: (tagIds: string[]) => void;
  onCreateTag: (name: string, color: string) => Promise<string>;
}

const PRESETS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
];

export const TagAssignModal: React.FC<TagAssignModalProps> = ({
  isOpen,
  onClose,
  availableTags,
  selectedTagIds,
  onSave,
  onCreateTag,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESETS[0]);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync initial state
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([...selectedTagIds]);
      setIsCreating(false);
      setNewTagName('');
      setNewTagColor(PRESETS[0]);
      setError(null);
    }
  }, [isOpen, selectedTagIds]);

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
    // Focus close button on mount
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTagSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleCreateTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = newTagName.trim();
    if (!name) {
      setError('Tag name cannot be empty');
      return;
    }

    try {
      const newId = await onCreateTag(name, newTagColor);
      setSelectedIds((prev) => [...prev, newId]);
      setIsCreating(false);
      setNewTagName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating tag.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Click outside to close handler */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-assign-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 id="tag-assign-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
            Manage Document Tags
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
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-950/60">
              {error}
            </div>
          )}

          {/* Tags list */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Select Tags
            </span>
            <div className="grid grid-cols-2 gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedIds.includes(tag.tagId);
                return (
                  <button
                    key={tag.tagId}
                    type="button"
                    onClick={() => toggleTagSelection(tag.tagId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20 text-blue-700 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  </button>
                );
              })}
              {availableTags.length === 0 && (
                <div className="col-span-2 text-center py-4 text-xs italic text-slate-400">
                  No tags created yet.
                </div>
              )}
            </div>
          </div>

          {/* Create tag toggle */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 focus:outline-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create New Tag
              </button>
            ) : (
              <form onSubmit={handleCreateTagSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="new-tag-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    New Tag Name
                  </label>
                  <input
                    id="new-tag-name"
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Chronic Care"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Choose Color
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all focus:outline-none ${
                          newTagColor === color ? 'border-slate-900 dark:border-slate-100 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select tag color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Save Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
            onClick={() => onSave(selectedIds)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Apply Tags
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagAssignModal;
