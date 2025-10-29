import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  @Get('*')
  async serveFile(@Param('0') path: string, @Res() res: Response) {
    try {
      const filePath = join(process.cwd(), 'uploads', path);
      
      if (!existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }

      return res.sendFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}