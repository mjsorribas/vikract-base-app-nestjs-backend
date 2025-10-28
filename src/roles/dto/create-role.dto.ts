import { IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayNotEmpty()
  permissions: string[];
}