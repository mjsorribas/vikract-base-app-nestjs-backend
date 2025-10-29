import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UploadsController } from '../uploads.controller';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('UploadsController', () => {
  let controller: UploadsController;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/test');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);

    // Mock response object
    mockResponse = {
      sendFile: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('serveFile', () => {
    beforeEach(() => {
      mockPath.join.mockReturnValue('/test/uploads/blog/test/file.jpg');
    });

    it('should serve existing file successfully', async () => {
      mockFs.existsSync.mockReturnValue(true);

      await controller.serveFile(
        'blog/test/file.jpg',
        mockResponse as Response,
      );

      expect(mockPath.join).toHaveBeenCalledWith(
        '/test',
        'uploads',
        'blog/test/file.jpg',
      );
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/uploads/blog/test/file.jpg',
      );
      expect(mockResponse.sendFile).toHaveBeenCalledWith(
        '/test/uploads/blog/test/file.jpg',
      );
    });

    it('should throw NotFoundException for non-existent file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(
        controller.serveFile('non-existent/file.jpg', mockResponse as Response),
      ).rejects.toThrow(NotFoundException);

      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should handle file system errors', async () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      await expect(
        controller.serveFile('error/file.jpg', mockResponse as Response),
      ).rejects.toThrow(NotFoundException);

      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should handle empty file path', async () => {
      mockPath.join.mockReturnValue('/test/uploads/');
      mockFs.existsSync.mockReturnValue(false);

      await expect(
        controller.serveFile('', mockResponse as Response),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle file paths with special characters', async () => {
      const specialPath = 'blog/test-blog/2025/10/28/image_123_abc.jpg';
      const fullPath = `/test/uploads/${specialPath}`;
      
      mockPath.join.mockReturnValue(fullPath);
      mockFs.existsSync.mockReturnValue(true);

      await controller.serveFile(specialPath, mockResponse as Response);

      expect(mockPath.join).toHaveBeenCalledWith('/test', 'uploads', specialPath);
      expect(mockResponse.sendFile).toHaveBeenCalledWith(fullPath);
    });

    it('should handle deeply nested file paths', async () => {
      const deepPath = 'blog/blog-id/2025/10/28/subfolder/image.jpg';
      const fullPath = `/test/uploads/${deepPath}`;
      
      mockPath.join.mockReturnValue(fullPath);
      mockFs.existsSync.mockReturnValue(true);

      await controller.serveFile(deepPath, mockResponse as Response);

      expect(mockPath.join).toHaveBeenCalledWith('/test', 'uploads', deepPath);
      expect(mockResponse.sendFile).toHaveBeenCalledWith(fullPath);
    });
  });
});