import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  blogId?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  generateThumbnail?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  compress?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  quality?: number = 85;
}

export class DeleteFileDto {
  @IsString()
  path: string;
}

export class GetFileDto {
  @IsString()
  path: string;
}

export class ListFilesDto {
  @IsString()
  directory: string;
}

export class CopyFileDto {
  @IsString()
  sourcePath: string;

  @IsString()
  destinationPath: string;
}

export class MoveFileDto {
  @IsString()
  sourcePath: string;

  @IsString()
  destinationPath: string;
}