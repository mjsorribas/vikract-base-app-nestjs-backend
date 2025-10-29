import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync, statSync } from 'fs';
import * as fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import {
  IStorageProvider,
  UploadResult,
  UploadOptions,
  FileType,
  FileFormat,
} from '../interfaces/storage.interface';
import {
  validateFile,
  generateFilePath,
  generateUniqueFilename,
  formatFileSize,
  getFileTypeFromMimeType,
  getFileFormatFromMimeType,
} from '../storage.utils';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads');
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.ensureUploadsDirExists();
  }

  private ensureUploadsDirExists(): void {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory: ${this.uploadsDir}`);
    }
  }

  async upload(
    file: Express.Multer.File,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const fileType = validation.fileType!;
      const fileFormat = validation.fileFormat!;

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(
        file.originalname,
        fileFormat,
      );

      // Generate file path
      const relativePath = generateFilePath(
        uniqueFilename,
        options?.blogId,
        options?.folder,
      );

      const fullPath = join(this.uploadsDir, relativePath);

      // Ensure directory exists
      const directory = join(fullPath, '..');
      await fse.ensureDir(directory);

      // Save file using Node.js fs with Uint8Array
      await fs.writeFile(fullPath, new Uint8Array(file.buffer));

      const result: UploadResult = {
        id: uuidv4(),
        filename: uniqueFilename,
        originalName: file.originalname,
        path: relativePath,
        url: this.getUrl(relativePath),
        size: file.size,
        mimeType: file.mimetype,
        type: fileType,
        format: fileFormat,
        blogId: options?.blogId,
        processedVersions: [],
        metadata: await this.extractMetadata(fullPath, fileType),
      };

      // Process file if needed
      if (
        (fileType === FileType.IMAGE || fileType === FileType.VIDEO) &&
        (options?.compress !== false || options?.generateThumbnail !== false)
      ) {
        result.processedVersions = await this.processFile(
          fullPath,
          relativePath,
          fileType,
          options,
        );
      }

      this.logger.log(`File uploaded successfully: ${relativePath}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async delete(path: string): Promise<boolean> {
    try {
      const fullPath = join(this.uploadsDir, path);

      if (!existsSync(fullPath)) {
        this.logger.warn(`File not found for deletion: ${path}`);
        return false;
      }

      await fs.unlink(fullPath);

      // Also delete processed versions
      const directory = join(fullPath, '..');
      const filename = join(fullPath).split('/').pop()!.split('.')[0];

      try {
        const files = await fs.readdir(directory);
        const processedFiles = files.filter((file) =>
          file.startsWith(`${filename}_`),
        );

        for (const processedFile of processedFiles) {
          const processedPath = join(directory, processedFile);
          if (existsSync(processedPath)) {
            await fs.unlink(processedPath);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to delete processed versions: ${error.message}`);
      }

      this.logger.log(`File deleted successfully: ${path}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      return false;
    }
  }

  getUrl(path: string): string {
    return `${this.baseUrl}/uploads/${path}`;
  }

  async exists(path: string): Promise<boolean> {
    const fullPath = join(this.uploadsDir, path);
    return existsSync(fullPath);
  }

  async getFileInfo(path: string): Promise<UploadResult | null> {
    try {
      const fullPath = join(this.uploadsDir, path);

      if (!existsSync(fullPath)) {
        return null;
      }

      const stats = statSync(fullPath);
      const filename = path.split('/').pop()!;
      const extension = filename.split('.').pop()!;
      const fileFormat = getFileFormatFromMimeType(`file.${extension}`) || extension as FileFormat;
      const fileType = getFileTypeFromMimeType(`file.${extension}`) || FileType.DOCUMENT;

      return {
        id: uuidv4(),
        filename,
        originalName: filename,
        path,
        url: this.getUrl(path),
        size: stats.size,
        mimeType: `file/${extension}`,
        type: fileType,
        format: fileFormat,
        metadata: await this.extractMetadata(fullPath, fileType),
      };
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`);
      return null;
    }
  }

  async copy(
    sourcePath: string,
    destinationPath: string,
  ): Promise<UploadResult> {
    try {
      const sourceFullPath = join(this.uploadsDir, sourcePath);
      const destFullPath = join(this.uploadsDir, destinationPath);

      if (!existsSync(sourceFullPath)) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      // Ensure destination directory exists
      const destDirectory = join(destFullPath, '..');
      await fse.ensureDir(destDirectory);

      await fse.copy(sourceFullPath, destFullPath);

      const stats = statSync(destFullPath);
      const filename = destinationPath.split('/').pop()!;
      const extension = filename.split('.').pop()!;
      const fileFormat = getFileFormatFromMimeType(`file.${extension}`) || extension as FileFormat;
      const fileType = getFileTypeFromMimeType(`file.${extension}`) || FileType.DOCUMENT;

      this.logger.log(`File copied successfully: ${sourcePath} -> ${destinationPath}`);

      return {
        id: uuidv4(),
        filename,
        originalName: filename,
        path: destinationPath,
        url: this.getUrl(destinationPath),
        size: stats.size,
        mimeType: `file/${extension}`,
        type: fileType,
        format: fileFormat,
        metadata: await this.extractMetadata(destFullPath, fileType),
      };
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`);
      throw error;
    }
  }

  async move(
    sourcePath: string,
    destinationPath: string,
  ): Promise<UploadResult> {
    const result = await this.copy(sourcePath, destinationPath);
    await this.delete(sourcePath);
    this.logger.log(`File moved successfully: ${sourcePath} -> ${destinationPath}`);
    return result;
  }

  async listFiles(directory: string): Promise<UploadResult[]> {
    try {
      const fullDirectory = join(this.uploadsDir, directory);

      if (!existsSync(fullDirectory)) {
        return [];
      }

      const files = await fs.readdir(fullDirectory, { withFileTypes: true });
      const results: UploadResult[] = [];

      for (const file of files) {
        if (file.isFile()) {
          const filePath = join(directory, file.name);
          const fileInfo = await this.getFileInfo(filePath);
          if (fileInfo) {
            results.push(fileInfo);
          }
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      return [];
    }
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    usedSpace: string;
  }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;

      const calculateDirSize = async (dir: string): Promise<void> => {
        const files = await fs.readdir(dir, { withFileTypes: true });

        for (const file of files) {
          const filePath = join(dir, file.name);

          if (file.isDirectory()) {
            await calculateDirSize(filePath);
          } else {
            const stats = statSync(filePath);
            totalFiles++;
            totalSize += stats.size;
          }
        }
      };

      await calculateDirSize(this.uploadsDir);

      return {
        totalFiles,
        totalSize,
        usedSpace: formatFileSize(totalSize),
      };
    } catch (error) {
      this.logger.error(`Failed to get storage stats: ${error.message}`);
      return {
        totalFiles: 0,
        totalSize: 0,
        usedSpace: '0 B',
      };
    }
  }

  private async processFile(
    fullPath: string,
    relativePath: string,
    fileType: FileType,
    options?: UploadOptions,
  ): Promise<any[]> {
    const processedVersions = [];

    try {
      if (fileType === FileType.IMAGE) {
        processedVersions.push(
          ...(await this.processImage(fullPath, relativePath, options)),
        );
      } else if (fileType === FileType.VIDEO) {
        processedVersions.push(
          ...(await this.processVideo(fullPath, relativePath, options)),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process file: ${error.message}`);
    }

    return processedVersions;
  }

  private async processImage(
    fullPath: string,
    relativePath: string,
    options?: UploadOptions,
  ): Promise<any[]> {
    const sharp = require('sharp');
    const processedVersions = [];
    const directory = join(fullPath, '..');
    const filename = fullPath.split('/').pop()!.split('.')[0];
    const extension = fullPath.split('.').pop()!;

    try {
      // Generate thumbnail
      if (options?.generateThumbnail !== false) {
        const thumbnailPath = join(directory, `${filename}_thumb.${extension}`);
        const thumbnailRelativePath = relativePath.replace(
          filename,
          `${filename}_thumb`,
        );

        await sharp(fullPath).resize(200, 200, { fit: 'inside' }).toFile(thumbnailPath);

        const thumbnailStats = statSync(thumbnailPath);
        processedVersions.push({
          type: 'thumbnail',
          path: thumbnailRelativePath,
          url: this.getUrl(thumbnailRelativePath),
          size: thumbnailStats.size,
          dimensions: { width: 200, height: 200 },
        });
      }

      // Compress image
      if (options?.compress !== false) {
        const compressedPath = join(directory, `${filename}_compressed.${extension}`);
        const compressedRelativePath = relativePath.replace(
          filename,
          `${filename}_compressed`,
        );

        const quality = options?.quality || 85;
        await sharp(fullPath)
          .jpeg({ quality })
          .toFile(compressedPath);

        const compressedStats = statSync(compressedPath);
        processedVersions.push({
          type: 'compressed',
          path: compressedRelativePath,
          url: this.getUrl(compressedRelativePath),
          size: compressedStats.size,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`);
    }

    return processedVersions;
  }

  private async processVideo(
    fullPath: string,
    relativePath: string,
    options?: UploadOptions,
  ): Promise<any[]> {
    // For now, just return empty array
    // Video processing will be implemented with ffmpeg
    this.logger.log('Video processing not implemented yet');
    return [];
  }

  private async extractMetadata(
    fullPath: string,
    fileType: FileType,
  ): Promise<any> {
    try {
      if (fileType === FileType.IMAGE) {
        const sharp = require('sharp');
        const metadata = await sharp(fullPath).metadata();
        return {
          dimensions: {
            width: metadata.width,
            height: metadata.height,
          },
        };
      }
    } catch (error) {
      this.logger.error(`Failed to extract metadata: ${error.message}`);
    }

    return {};
  }
}