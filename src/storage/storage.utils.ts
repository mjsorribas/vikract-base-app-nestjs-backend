import { FileType, FileFormat, FileConfig } from './interfaces/storage.interface';

// File size limits in MB
export const FILE_SIZE_LIMITS = {
  [FileType.AUDIO]: 50 * 1024 * 1024, // 50MB
  [FileType.VIDEO]: 100 * 1024 * 1024, // 100MB  
  [FileType.IMAGE]: 10 * 1024 * 1024, // 10MB
  [FileType.DOCUMENT]: 20 * 1024 * 1024, // 20MB
};

// File configurations by type
export const FILE_CONFIGS: Record<FileType, FileConfig> = {
  [FileType.AUDIO]: {
    type: FileType.AUDIO,
    formats: [FileFormat.MP3, FileFormat.OGG],
    maxSize: FILE_SIZE_LIMITS[FileType.AUDIO],
    requiresProcessing: false,
  },
  [FileType.VIDEO]: {
    type: FileType.VIDEO,
    formats: [FileFormat.MP4],
    maxSize: FILE_SIZE_LIMITS[FileType.VIDEO],
    requiresProcessing: true,
  },
  [FileType.IMAGE]: {
    type: FileType.IMAGE,
    formats: [FileFormat.JPG, FileFormat.JPEG, FileFormat.PNG, FileFormat.WEBP],
    maxSize: FILE_SIZE_LIMITS[FileType.IMAGE],
    requiresProcessing: true,
  },
  [FileType.DOCUMENT]: {
    type: FileType.DOCUMENT,
    formats: [
      FileFormat.PDF,
      FileFormat.DOC,
      FileFormat.DOCX,
      FileFormat.XLS,
      FileFormat.XLSX,
      FileFormat.TXT,
    ],
    maxSize: FILE_SIZE_LIMITS[FileType.DOCUMENT],
    requiresProcessing: false,
  },
};

// MIME type mappings
export const MIME_TYPE_MAP: Record<string, FileFormat> = {
  // Audio
  'audio/mpeg': FileFormat.MP3,
  'audio/mp3': FileFormat.MP3,
  'audio/ogg': FileFormat.OGG,
  'application/ogg': FileFormat.OGG,
  
  // Video
  'video/mp4': FileFormat.MP4,
  'video/mpeg': FileFormat.MP4,
  
  // Images
  'image/jpeg': FileFormat.JPEG,
  'image/jpg': FileFormat.JPG,
  'image/png': FileFormat.PNG,
  'image/webp': FileFormat.WEBP,
  
  // Documents
  'application/pdf': FileFormat.PDF,
  'application/msword': FileFormat.DOC,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileFormat.DOCX,
  'application/vnd.ms-excel': FileFormat.XLS,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileFormat.XLSX,
  'text/plain': FileFormat.TXT,
};

// Reverse mapping: format to primary MIME type
export const FORMAT_TO_MIME_TYPE: Record<FileFormat, string> = {
  // Audio
  [FileFormat.MP3]: 'audio/mpeg',
  [FileFormat.OGG]: 'audio/ogg',
  
  // Video
  [FileFormat.MP4]: 'video/mp4',
  
  // Images
  [FileFormat.JPG]: 'image/jpeg',
  [FileFormat.JPEG]: 'image/jpeg',
  [FileFormat.PNG]: 'image/png',
  [FileFormat.WEBP]: 'image/webp',
  
  // Documents
  [FileFormat.PDF]: 'application/pdf',
  [FileFormat.DOC]: 'application/msword',
  [FileFormat.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [FileFormat.XLS]: 'application/vnd.ms-excel',
  [FileFormat.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  [FileFormat.TXT]: 'text/plain',
};

// Get file type from MIME type
export function getFileTypeFromMimeType(mimeType: string): FileType | null {
  const format = MIME_TYPE_MAP[mimeType];
  if (!format) return null;
  
  for (const [type, config] of Object.entries(FILE_CONFIGS)) {
    if (config.formats.includes(format)) {
      return type as FileType;
    }
  }
  return null;
}

// Get file format from MIME type
export function getFileFormatFromMimeType(mimeType: string): FileFormat | null {
  return MIME_TYPE_MAP[mimeType] || null;
}

// Get file format from extension
export function getFileFormatFromExtension(extension: string): FileFormat | null {
  const ext = extension.toLowerCase().replace('.', '');
  return Object.values(FileFormat).find(format => format === ext) || null;
}

// Validate file against configuration
export function validateFile(
  file: Express.Multer.File,
  allowedTypes?: FileType[]
): {
  isValid: boolean;
  fileType?: FileType;
  fileFormat?: FileFormat;
  error?: string;
} {
  // Get file type and format
  const fileType = getFileTypeFromMimeType(file.mimetype);
  const fileFormat = getFileFormatFromMimeType(file.mimetype);
  
  if (!fileType || !fileFormat) {
    return {
      isValid: false,
      error: `Tipo de archivo no soportado: ${file.mimetype}`,
    };
  }
  
  // Check if type is allowed
  if (allowedTypes && !allowedTypes.includes(fileType)) {
    return {
      isValid: false,
      fileType,
      fileFormat,
      error: `Tipo de archivo no permitido: ${fileType}`,
    };
  }
  
  // Check file size
  const config = FILE_CONFIGS[fileType];
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      isValid: false,
      fileType,
      fileFormat,
      error: `Archivo demasiado grande. Máximo permitido: ${maxSizeMB}MB`,
    };
  }
  
  return {
    isValid: true,
    fileType,
    fileFormat,
  };
}

// Generate file path with blog/date structure
export function generateFilePath(
  filename: string,
  blogId?: string,
  customFolder?: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const dateFolder = `${year}/${month}/${day}`;
  
  if (customFolder) {
    return `${customFolder}/${dateFolder}/${filename}`;
  }
  
  if (blogId) {
    return `blog/${blogId}/${dateFolder}/${filename}`;
  }
  
  return `uploads/${dateFolder}/${filename}`;
}

// Generate unique filename
export function generateUniqueFilename(
  originalName: string,
  fileFormat: FileFormat
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .substring(0, 50);
  
  return `${safeName}_${timestamp}_${random}.${fileFormat}`;
}

// Convert bytes to human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}