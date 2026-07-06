import React, { useState } from 'react';
import { Folder, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FolderCardProps {
  folderId: string;
  name: string;
  onOpen: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folderId,
  name,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(folderId);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => onOpen(folderId)}
      className={cn(
        "group relative flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      )}
    >
      <div className="flex items-center space-x-3 truncate">
        <Folder className="h-6 w-6 text-blue-500 shrink-0" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {name}
        </span>
      </div>

      {/* Actions Dropdown */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Folder operations menu"
          aria-expanded={showMenu}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-20 focus:outline-none">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onRename(folderId, name);
                }}
                className="w-full flex items-center px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(folderId);
                }}
                className="w-full flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FolderCard;
