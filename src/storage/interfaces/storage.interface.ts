export enum FileType {
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export enum FileFormat {
  // Audio
  MP3 = 'mp3',
  OGG = 'ogg',
  
  // Video
  MP4 = 'mp4',
  
  // Images
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  
  // Documents
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  TXT = 'txt',
}

export interface FileConfig {
  type: FileType;
  formats: FileFormat[];
  maxSize: number; // in bytes
  requiresProcessing: boolean;
}

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  type: FileType;
  format: FileFormat;
  blogId?: string;
  processedVersions?: ProcessedVersion[];
  metadata?: FileMetadata;
}

export interface ProcessedVersion {
  type: 'thumbnail' | 'compressed' | 'preview';
  path: string;
  url: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface FileMetadata {
  duration?: number; // for audio/video in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  bitrate?: number; // for audio/video
  fps?: number; // for video
  codec?: string;
  pages?: number; // for documents
}

export interface UploadOptions {
  blogId?: string;
  folder?: string;
  generateThumbnail?: boolean;
  compress?: boolean;
  quality?: number; // 1-100 for image/video compression
}

export interface IStorageProvider {
  /**
   * Upload a file to storage
   */
  upload(
    file: Express.Multer.File,
    options?: UploadOptions,
  ): Promise<UploadResult>;

  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<boolean>;

  /**
   * Get public URL for a file
   */
  getUrl(path: string): string;

  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file info/metadata
   */
  getFileInfo(path: string): Promise<UploadResult | null>;

  /**
   * Copy file to another location
   */
  copy(sourcePath: string, destinationPath: string): Promise<UploadResult>;

  /**
   * Move file to another location
   */
  move(sourcePath: string, destinationPath: string): Promise<UploadResult>;

  /**
   * List files in a directory
   */
  listFiles(directory: string): Promise<UploadResult[]>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    usedSpace: string;
  }>;
}