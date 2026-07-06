import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import type { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

// Mock Firebase / Firestore Modules
vi.mock('@/firebase/client', () => {
  return {
    db: { type: 'mock-db' },
  };
});

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, path, ...segments) => ({ type: 'document', path, segments })),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn((q) => q),
    where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
  };
});

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob(['mock-zip-content'])),
      };
    }),
  };
});

// Import services to test
import { FolderService } from './services/FolderService';
import { TagService } from './services/TagService';
import { ExportService } from './services/ExportService';

interface MockDocRef {
  segments?: string[];
}

describe('Medical Document Management Module Tests', () => {
  let folderService: FolderService;
  let tagService: TagService;
  let exportService: ExportService;

  const mockActor = { actorId: 'actor-1', actorRole: 'citizen' };

  beforeEach(() => {
    vi.clearAllMocks();
    folderService = new FolderService();
    tagService = new TagService();
    exportService = new ExportService();
  });

  // ─── FolderService Tests ─────────────────────────────────────────────────────
  describe('FolderService', () => {
    it('should successfully create a new folder at Root level', async () => {
      const setDocMock = vi.mocked(setDoc);

      const folderId = await folderService.createFolder('Prescriptions', 'patient-1', null, mockActor);

      expect(folderId).toBeDefined();
      expect(typeof folderId).toBe('string');
      expect(setDocMock).toHaveBeenCalled();
    });

    it('should validate folder name limits', async () => {
      await expect(
        folderService.createFolder('', 'patient-1', null, mockActor)
      ).rejects.toThrow('Folder name cannot be empty');

      const longName = 'a'.repeat(101);
      await expect(
        folderService.createFolder(longName, 'patient-1', null, mockActor)
      ).rejects.toThrow('Folder name cannot exceed 100 characters');
    });

    it('should validate nesting depth limits', async () => {
      const getDocMock = vi.mocked(getDoc);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getDocMock.mockImplementation(async (docRef: any) => {
        const mockRef = docRef as unknown as MockDocRef;
        const id = mockRef.segments ? mockRef.segments[0] : '';
        if (id === 'folder-1') {
          return {
            exists: () => true,
            data: () => ({ folderId: 'folder-1', name: 'L1', ownerId: 'patient-1', parentFolderId: null }),
          } as unknown as DocumentSnapshot;
        }
        if (id === 'folder-2') {
          return {
            exists: () => true,
            data: () => ({ folderId: 'folder-2', name: 'L2', ownerId: 'patient-1', parentFolderId: 'folder-1' }),
          } as unknown as DocumentSnapshot;
        }
        if (id === 'folder-3') {
          return {
            exists: () => true,
            data: () => ({ folderId: 'folder-3', name: 'L3', ownerId: 'patient-1', parentFolderId: 'folder-2' }),
          } as unknown as DocumentSnapshot;
        }
        return { exists: () => false } as unknown as DocumentSnapshot;
      });

      // Try adding child to level 3 (exceeding depth of 3)
      await expect(
        folderService.createFolder('Level 4', 'patient-1', 'folder-3', mockActor)
      ).rejects.toThrow('Maximum folder nesting depth of 3 exceeded');
    });

    it('should allow renaming folders with validation', async () => {
      const getDocMock = vi.mocked(getDoc);
      const updateDocMock = vi.mocked(updateDoc);

      getDocMock.mockResolvedValue({
        exists: () => true,
        data: () => ({ folderId: 'folder-1', name: 'Old Name', ownerId: 'patient-1' }),
      } as unknown as DocumentSnapshot);

      await folderService.renameFolder('folder-1', 'New Name', 'patient-1', mockActor);

      expect(updateDocMock).toHaveBeenCalled();
    });
  });

  // ─── TagService Tests ────────────────────────────────────────────────────────
  describe('TagService', () => {
    it('should successfully create a new tag', async () => {
      const setDocMock = vi.mocked(setDoc);

      const tagId = await tagService.createTag('Diabetic Care', '#EF4444', 'patient-1', mockActor);

      expect(tagId).toBeDefined();
      expect(setDocMock).toHaveBeenCalled();
    });

    it('should successfully map a document to a folder', async () => {
      const setDocMock = vi.mocked(setDoc);
      const getDocsMock = vi.mocked(getDocs);

      // Mock no existing mapping
      getDocsMock.mockResolvedValue({ empty: true, docs: [] } as unknown as QuerySnapshot);

      await tagService.assignDocumentFolder('record-1', 'folder-1', 'patient-1', mockActor);

      expect(setDocMock).toHaveBeenCalled();
    });

    it('should successfully map a document to a set of tags', async () => {
      const setDocMock = vi.mocked(setDoc);
      const getDocsMock = vi.mocked(getDocs);

      // Mock no existing mapping
      getDocsMock.mockResolvedValue({ empty: true, docs: [] } as unknown as QuerySnapshot);

      await tagService.assignDocumentTags('record-1', ['tag-1', 'tag-2'], 'patient-1', mockActor);

      expect(setDocMock).toHaveBeenCalled();
    });
  });

  // ─── ExportService Tests ─────────────────────────────────────────────────────
  describe('ExportService', () => {
    it('should perform print multiple records with printing iframe generation', async () => {
      const mockIframeDoc = {
        write: vi.fn(),
        close: vi.fn(),
      };
      
      const mockIframe = {
        style: {},
        contentDocument: mockIframeDoc,
        contentWindow: {
          focus: vi.fn(),
          print: vi.fn(),
        },
      };

      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockIframe),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      });

      await exportService.printMultipleRecords(
        [
          {
            title: 'Lab Report',
            date: '2026-07-06',
            provider: 'Dr. John',
            detailsHtml: '<div>Observation normal</div>',
          },
        ],
        'patient-1',
        mockActor
      );

      expect(mockIframeDoc.write).toHaveBeenCalled();
    });
  });
});
