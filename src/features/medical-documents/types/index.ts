import { z } from 'zod';

// Reuse Firestore Timestamp support
export const TimestampSchema = z.union([
  z.date(),
  z.string().datetime(),
  z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
]);

export const FolderSchema = z.object({
  folderId: z.string().min(1, 'Folder ID is required'),
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name is too long'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  parentFolderId: z.string().nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Folder = z.infer<typeof FolderSchema>;

export const TagSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  color: z.string().min(1, 'Color code is required'),
  createdAt: TimestampSchema,
});

export type Tag = z.infer<typeof TagSchema>;

export const DocumentMappingSchema = z.object({
  mappingId: z.string().min(1, 'Mapping ID is required'),
  recordId: z.string().min(1, 'Record ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  folderId: z.string().nullable(),
  tagIds: z.array(z.string()),
  updatedAt: TimestampSchema,
});

export type DocumentMapping = z.infer<typeof DocumentMappingSchema>;
