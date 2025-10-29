import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  IStorageProvider,
  UploadResult,
  UploadOptions,
  FileType,
} from './interfaces/storage.interface';
import { LocalStorageProvider } from './providers/local.provider';
import { File } from './entities/file.entity';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly currentProvider: IStorageProvider;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
    private readonly localProvider: LocalStorageProvider,
  ) {
    // Initialize provider based on configuration
    const storageProvider = this.configService.get<string>(
      'STORAGE_PROVIDER',
      'local',
    );

    switch (storageProvider) {
      case 'local':
        this.currentProvider = this.localProvider;
        break;
      case 'minio':
        // TODO: Implement MinIO provider
        this.currentProvider = this.localProvider;
        this.logger.warn('MinIO provider not implemented, using local storage');
        break;
      case 's3':
        // TODO: Implement S3 provider
        this.currentProvider = this.localProvider;
        this.logger.warn('S3 provider not implemented, using local storage');
        break;
      default:
        this.currentProvider = this.localProvider;
        this.logger.warn(
          `Unknown storage provider '${storageProvider}', using local storage`,
        );
    }

    this.logger.log(`Storage service initialized with provider: ${storageProvider}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions & { uploadedById?: string },
  ): Promise<File> {
    try {
      this.logger.log(`Uploading file: ${file.originalname}`);

      // Upload file using current provider
      const uploadResult: UploadResult = await this.currentProvider.upload(
        file,
        options,
      );

      // Save file info to database
      const fileEntity = this.fileRepository.create({
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        path: uploadResult.path,
        url: uploadResult.url,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        type: uploadResult.type,
        format: uploadResult.format,
        blogId: options?.blogId,
        uploadedById: options?.uploadedById,
        processedVersions: uploadResult.processedVersions,
        metadata: uploadResult.metadata,
        folder: options?.folder,
      });

      const savedFile = await this.fileRepository.save(fileEntity);

      this.logger.log(`File uploaded and saved: ${savedFile.id}`);
      return savedFile;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
      });

      if (!file) {
        throw new NotFoundException(`File not found: ${fileId}`);
      }

      // Delete from storage provider
      const deleted = await this.currentProvider.delete(file.path);

      if (deleted) {
        // Soft delete from database
        await this.fileRepository.softDelete(fileId);
        this.logger.log(`File deleted successfully: ${fileId}`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['blog', 'uploadedBy'],
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }

    return file;
  }

  async getFilesByBlog(blogId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { blogId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { uploadedById: userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getFilesByType(fileType: FileType): Promise<File[]> {
    return this.fileRepository.find({
      where: { type: fileType, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listFiles(
    directory: string,
    options?: {
      blogId?: string;
      userId?: string;
      fileType?: FileType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    files: File[];
    total: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .where('file.isActive = :isActive', { isActive: true });

    if (options?.blogId) {
      queryBuilder.andWhere('file.blogId = :blogId', {
        blogId: options.blogId,
      });
    }

    if (options?.userId) {
      queryBuilder.andWhere('file.uploadedById = :userId', {
        userId: options.userId,
      });
    }

    if (options?.fileType) {
      queryBuilder.andWhere('file.type = :fileType', {
        fileType: options.fileType,
      });
    }

    if (directory) {
      queryBuilder.andWhere('file.path LIKE :directory', {
        directory: `${directory}%`,
      });
    }

    queryBuilder.orderBy('file.createdAt', 'DESC');

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    queryBuilder.skip(offset).take(limit + 1);

    const files = await queryBuilder.getMany();
    const hasMore = files.length > limit;

    if (hasMore) {
      files.pop(); // Remove the extra item used to check for more
    }

    const total = await queryBuilder.getCount();

    return {
      files,
      total,
      hasMore,
    };
  }

  async copyFile(
    fileId: string,
    destinationPath: string,
  ): Promise<File> {
    const sourceFile = await this.getFile(fileId);

    // Copy file using storage provider
    const copyResult = await this.currentProvider.copy(
      sourceFile.path,
      destinationPath,
    );

    // Create new file entity
    const copiedFile = this.fileRepository.create({
      filename: copyResult.filename,
      originalName: sourceFile.originalName,
      path: copyResult.path,
      url: copyResult.url,
      size: copyResult.size,
      mimeType: copyResult.mimeType,
      type: copyResult.type,
      format: copyResult.format,
      blogId: sourceFile.blogId,
      uploadedById: sourceFile.uploadedById,
      processedVersions: copyResult.processedVersions,
      metadata: copyResult.metadata,
      folder: sourceFile.folder,
    });

    return this.fileRepository.save(copiedFile);
  }

  async moveFile(
    fileId: string,
    destinationPath: string,
  ): Promise<File> {
    const sourceFile = await this.getFile(fileId);

    // Move file using storage provider
    const moveResult = await this.currentProvider.move(
      sourceFile.path,
      destinationPath,
    );

    // Update file entity
    sourceFile.path = moveResult.path;
    sourceFile.url = moveResult.url;
    sourceFile.filename = moveResult.filename;

    return this.fileRepository.save(sourceFile);
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    usedSpace: string;
    filesByType: Record<FileType, number>;
  }> {
    const providerStats = await this.currentProvider.getStats();

    // Get file counts by type from database
    const filesByType = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('file.isActive = :isActive', { isActive: true })
      .groupBy('file.type')
      .getRawMany();

    const typeStats = filesByType.reduce(
      (acc, item) => {
        acc[item.type as FileType] = parseInt(item.count);
        return acc;
      },
      {} as Record<FileType, number>,
    );

    return {
      ...providerStats,
      filesByType: typeStats,
    };
  }

  getFileUrl(path: string): string {
    return this.currentProvider.getUrl(path);
  }

  async fileExists(path: string): Promise<boolean> {
    return this.currentProvider.exists(path);
  }
}