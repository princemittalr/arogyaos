import { storage } from './client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const storageHelpers = {
  uploadFile: async (path: string, file: Blob | Uint8Array | ArrayBuffer) => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
  },

  getFileUrl: async (path: string) => {
    const fileRef = ref(storage, path);
    return getDownloadURL(fileRef);
  },

  deleteFile: async (path: string) => {
    const fileRef = ref(storage, path);
    return deleteObject(fileRef);
  },
};
export default storage;
