import {
  validateFile,
  getFileTypeFromMimeType,
  getFileFormatFromMimeType,
  getFileFormatFromExtension,
  generateFilePath,
  generateUniqueFilename,
  formatFileSize,
} from '../storage.utils';
import { FileType, FileFormat } from '../interfaces/storage.interface';

describe('StorageUtils', () => {
  describe('getFileTypeFromMimeType', () => {
    it('should return correct file type for audio files', () => {
      expect(getFileTypeFromMimeType('audio/mpeg')).toBe(FileType.AUDIO);
      expect(getFileTypeFromMimeType('audio/ogg')).toBe(FileType.AUDIO);
    });

    it('should return correct file type for video files', () => {
      expect(getFileTypeFromMimeType('video/mp4')).toBe(FileType.VIDEO);
    });

    it('should return correct file type for image files', () => {
      expect(getFileTypeFromMimeType('image/jpeg')).toBe(FileType.IMAGE);
      expect(getFileTypeFromMimeType('image/png')).toBe(FileType.IMAGE);
      expect(getFileTypeFromMimeType('image/webp')).toBe(FileType.IMAGE);
    });

    it('should return correct file type for document files', () => {
      expect(getFileTypeFromMimeType('application/pdf')).toBe(FileType.DOCUMENT);
      expect(getFileTypeFromMimeType('text/plain')).toBe(FileType.DOCUMENT);
    });

    it('should return null for unsupported mime types', () => {
      expect(getFileTypeFromMimeType('application/unknown')).toBeNull();
      expect(getFileTypeFromMimeType('text/html')).toBeNull();
    });
  });

  describe('getFileFormatFromMimeType', () => {
    it('should return correct format for supported mime types', () => {
      expect(getFileFormatFromMimeType('audio/mpeg')).toBe(FileFormat.MP3);
      expect(getFileFormatFromMimeType('image/jpeg')).toBe(FileFormat.JPEG);
      expect(getFileFormatFromMimeType('application/pdf')).toBe(FileFormat.PDF);
    });

    it('should return null for unsupported mime types', () => {
      expect(getFileFormatFromMimeType('application/unknown')).toBeNull();
    });
  });

  describe('getFileFormatFromExtension', () => {
    it('should return correct format for valid extensions', () => {
      expect(getFileFormatFromExtension('jpg')).toBe(FileFormat.JPG);
      expect(getFileFormatFromExtension('.png')).toBe(FileFormat.PNG);
      expect(getFileFormatFromExtension('PDF')).toBe(FileFormat.PDF);
    });

    it('should return null for invalid extensions', () => {
      expect(getFileFormatFromExtension('unknown')).toBeNull();
      expect(getFileFormatFromExtension('')).toBeNull();
    });
  });

  describe('validateFile', () => {
    const createMockFile = (
      mimetype: string,
      size: number,
      originalname = 'test.jpg',
    ): Express.Multer.File => ({
      fieldname: 'file',
      originalname,
      encoding: '7bit',
      mimetype,
      size,
      destination: '',
      filename: '',
      path: '',
      buffer: Buffer.from('test'),
      stream: null as any,
    });

    it('should validate image files correctly', () => {
      const file = createMockFile('image/jpeg', 5 * 1024 * 1024); // 5MB
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe(FileType.IMAGE);
      expect(result.fileFormat).toBe(FileFormat.JPEG);
    });

    it('should reject oversized files', () => {
      const file = createMockFile('image/jpeg', 15 * 1024 * 1024); // 15MB
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('demasiado grande');
    });

    it('should reject unsupported file types', () => {
      const file = createMockFile('application/unknown', 1024);
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no soportado');
    });

    it('should validate allowed types only', () => {
      const file = createMockFile('audio/mpeg', 1024);
      const result = validateFile(file, [FileType.IMAGE]);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no permitido');
    });

    it('should validate video files within size limit', () => {
      const file = createMockFile('video/mp4', 50 * 1024 * 1024); // 50MB
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe(FileType.VIDEO);
    });

    it('should validate document files correctly', () => {
      const file = createMockFile('application/pdf', 10 * 1024 * 1024); // 10MB
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe(FileType.DOCUMENT);
      expect(result.fileFormat).toBe(FileFormat.PDF);
    });
  });

  describe('generateFilePath', () => {
    const mockDate = new Date('2025-10-28T12:00:00Z');
    
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should generate path with blog ID', () => {
      const path = generateFilePath('test.jpg', 'blog-123');
      expect(path).toBe('blog/blog-123/2025/10/28/test.jpg');
    });

    it('should generate path with custom folder', () => {
      const path = generateFilePath('test.jpg', undefined, 'custom');
      expect(path).toBe('custom/2025/10/28/test.jpg');
    });

    it('should generate default uploads path', () => {
      const path = generateFilePath('test.jpg');
      expect(path).toBe('uploads/2025/10/28/test.jpg');
    });

    it('should format dates with leading zeros', () => {
      const earlyDate = new Date('2025-01-05T12:00:00Z');
      jest.setSystemTime(earlyDate);
      
      const path = generateFilePath('test.jpg', 'blog-123');
      expect(path).toBe('blog/blog-123/2025/01/05/test.jpg');
    });
  });

  describe('generateUniqueFilename', () => {
    beforeEach(() => {
      // Mock Math.random to return consistent value for testing
      jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
      // Mock Date.now to return consistent timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1698521832000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should generate unique filename with timestamp and random string', () => {
      const filename = generateUniqueFilename('my test file.jpg', FileFormat.JPG);
      expect(filename).toMatch(/^mytestfile_1698521832000_\w+\.jpg$/);
    });

    it('should sanitize filename removing special characters', () => {
      const filename = generateUniqueFilename('my@file#with$special.png', FileFormat.PNG);
      expect(filename).toMatch(/^myfilewithspecial_1698521832000_\w+\.png$/);
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(100) + '.pdf';
      const filename = generateUniqueFilename(longName, FileFormat.PDF);
      expect(filename.length).toBeLessThan(90); // Should be truncated (adjusted for timestamp)
    });

    it('should handle empty original names', () => {
      const filename = generateUniqueFilename('', FileFormat.MP3);
      expect(filename).toMatch(/^_1698521832000_\w+\.mp3$/);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(102400)).toBe('100 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(104857600)).toBe('100 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
    });

    it('should handle large numbers', () => {
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
  });
});