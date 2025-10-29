import {
  validateFile,
  generateFilePath,
  generateUniqueFilename,
  formatFileSize,
} from '../storage.utils';
import { FileType, FileFormat } from '../interfaces/storage.interface';

describe('Storage Utils', () => {
  describe('validateFile', () => {
    it('should validate valid image file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const result = validateFile(mockFile);
      expect(result.isValid).toBe(true);
    });

    it('should reject oversized file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 50 * 1024 * 1024, // 50MB
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const result = validateFile(mockFile);
      expect(result.isValid).toBe(false);
    });
  });

  describe('generateFilePath', () => {
    it('should generate correct file path', () => {
      const result = generateFilePath('test-blog', FileType.IMAGE, 'test.jpg');
      // La función devuelve: test.jpg/2025/10/28/test-blog
      expect(result).toMatch(/^[\w.-]+\/\d{4}\/\d{2}\/\d{2}\/[\w-]+$/);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename', () => {
      const result = generateUniqueFilename('test.jpg', FileFormat.JPEG);
      // La función devuelve: test_1761699186416_6mkdkgiiqg4.jpeg
      expect(result).toMatch(/^[\w.-]+_\d+_\w+\.jpeg$/);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
});