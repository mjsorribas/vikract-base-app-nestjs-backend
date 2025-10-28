import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLanguageDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}