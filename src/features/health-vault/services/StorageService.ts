import { StorageRepository } from '../repositories/StorageRepository';
import { UploadService } from './UploadService';
import { DownloadService } from './DownloadService';
import { PreviewService } from './PreviewService';
import { ArchiveService } from './ArchiveService';
import { VersionService } from './VersionService';

export class StorageService {
  public readonly repository = new StorageRepository();
  public readonly upload = new UploadService();
  public readonly download = new DownloadService();
  public readonly preview = new PreviewService();
  public readonly archive = new ArchiveService();
  public readonly version = new VersionService();
}

export default StorageService;
