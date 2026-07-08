import React from 'react';
import { FileText, FolderPlus, Tag as TagIcon, Eye, Download } from 'lucide-react';
import { TimelineIndexEntry } from '@/features/health-vault/types';
import { Tag } from '../types';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';


interface DocumentRowProps {
  record: TimelineIndexEntry;
  tags: Tag[];
  currentTagIds: string[];
  currentFolderName: string | null;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onDownload: () => void;
  onAssignFolder: () => void;
  onAssignTags: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
  record,
  tags,
  currentTagIds,
  currentFolderName,
  isSelected,
  onToggleSelect,
  onView,
  onDownload,
  onAssignFolder,
  onAssignTags,
}) => {
  const recordDate = record.encounterDate
    ? new Date(
        typeof (record.encounterDate as { toDate?: () => Date }).toDate === 'function'
          ? (record.encounterDate as { toDate: () => Date }).toDate()
          : (record.encounterDate as string | number)
      ).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : 'Unknown Date';

  // Find tags mapped to this document
  const documentTags = tags.filter(t => currentTagIds.includes(t.tagId));

  return (
    <tr
      className={cn(
        "group border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors",
        isSelected && "bg-blue-50/20 dark:bg-blue-950/10"
      )}
    >
      {/* Checkbox */}
      <td className="py-4 pl-4 w-12 align-middle">
        <Input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
          aria-label={`Select document ${record.summaryFields.title}`}
        />
      </td>

      {/* Record Title & Provider */}
      <td className="py-4 px-3 max-w-xs align-middle">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500">
            <FileText className="h-5 w-5 shrink-0" />
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
              {record.summaryFields.title}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
              {record.summaryFields.providerName} &bull; {record.summaryFields.hospitalName}
            </span>
          </div>
        </div>
      </td>

      {/* Folder status */}
      <td className="py-4 px-3 text-sm text-slate-500 dark:text-slate-400 align-middle">
        {currentFolderName ? (
          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {currentFolderName}
          </span>
        ) : (
          <span className="text-xs italic text-slate-400">Root</span>
        )}
      </td>

      {/* Tags */}
      <td className="py-4 px-3 align-middle">
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {documentTags.map((tag) => (
            <span
              key={tag.tagId}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${tag.color}15`,
                color: tag.color,
                border: `1px solid ${tag.color}30`,
              }}
            >
              {tag.name}
            </span>
          ))}
          {documentTags.length === 0 && (
            <span className="text-xs italic text-slate-400">No tags</span>
          )}
        </div>
      </td>

      {/* Encounter Date */}
      <td className="py-4 px-3 text-sm text-slate-500 dark:text-slate-400 align-middle">
        {recordDate}
      </td>

      {/* Actions */}
      <td className="py-4 pr-4 pl-3 text-right align-middle">
        <div className="flex items-center justify-end space-x-1">
          <button
            type="button"
            onClick={onAssignFolder}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Move to folder"
          >
            <FolderPlus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={onAssignTags}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Manage tags"
          >
            <TagIcon className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={onView}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Download"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;
