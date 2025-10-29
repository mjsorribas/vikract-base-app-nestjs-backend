import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import { StorageService } from './storage.service';
import { UploadFileDto, DeleteFileDto, ListFilesDto } from './dto/storage.dto';
import { FileType } from './interfaces/storage.interface';
import { validateFile } from './storage.utils';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const uploadedFile = await this.storageService.uploadFile(file, {
      ...uploadDto,
      uploadedById: req.user.id,
    });

    return {
      success: true,
      message: 'File uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('upload/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate that it's an image
    const validation = validateFile(file, [FileType.IMAGE]);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const uploadedFile = await this.storageService.uploadFile(file, {
      ...uploadDto,
      uploadedById: req.user.id,
    });

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('upload/videos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate that it's a video
    const validation = validateFile(file, [FileType.VIDEO]);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const uploadedFile = await this.storageService.uploadFile(file, {
      ...uploadDto,
      uploadedById: req.user.id,
    });

    return {
      success: true,
      message: 'Video uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('upload/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate that it's a document
    const validation = validateFile(file, [FileType.DOCUMENT]);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const uploadedFile = await this.storageService.uploadFile(file, {
      ...uploadDto,
      uploadedById: req.user.id,
    });

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('upload/audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate that it's audio
    const validation = validateFile(file, [FileType.AUDIO]);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const uploadedFile = await this.storageService.uploadFile(file, {
      ...uploadDto,
      uploadedById: req.user.id,
    });

    return {
      success: true,
      message: 'Audio uploaded successfully',
      data: uploadedFile,
    };
  }

  @Get('files')
  async listFiles(@Query() query: ListFilesDto & {
    blogId?: string;
    userId?: string;
    fileType?: FileType;
    limit?: string;
    offset?: string;
  }) {
    const result = await this.storageService.listFiles(query.directory, {
      blogId: query.blogId,
      userId: query.userId,
      fileType: query.fileType,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });

    return {
      success: true,
      message: 'Files retrieved successfully',
      data: result,
    };
  }

  @Get('files/:id')
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    const file = await this.storageService.getFile(id);

    return {
      success: true,
      message: 'File retrieved successfully',
      data: file,
    };
  }

  @Get('blog/:blogId/files')
  async getFilesByBlog(@Param('blogId', ParseUUIDPipe) blogId: string) {
    const files = await this.storageService.getFilesByBlog(blogId);

    return {
      success: true,
      message: 'Blog files retrieved successfully',
      data: files,
    };
  }

  @Get('user/:userId/files')
  async getFilesByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const files = await this.storageService.getFilesByUser(userId);

    return {
      success: true,
      message: 'User files retrieved successfully',
      data: files,
    };
  }

  @Get('type/:fileType/files')
  async getFilesByType(@Param('fileType') fileType: FileType) {
    const files = await this.storageService.getFilesByType(fileType);

    return {
      success: true,
      message: `${fileType} files retrieved successfully`,
      data: files,
    };
  }

  @Get('stats')
  async getStorageStats() {
    const stats = await this.storageService.getStorageStats();

    return {
      success: true,
      message: 'Storage statistics retrieved successfully',
      data: stats,
    };
  }

  @Delete('files/:id')
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.storageService.deleteFile(id);

    return {
      success: deleted,
      message: deleted 
        ? 'File deleted successfully' 
        : 'Failed to delete file',
      data: { deleted },
    };
  }
}