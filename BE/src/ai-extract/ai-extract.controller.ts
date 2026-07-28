import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { AiExtractService } from './ai-extract.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('AI Extract')
@ApiBearerAuth()
@Controller('api')
export class AiExtractController {
  private readonly logger = new Logger(AiExtractController.name);

  constructor(private readonly aiExtractService: AiExtractService) {}

  @Post('documents/ai-extract')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upload file tài liệu (DOCX/PDF/TXT) để AI trích xuất API endpoints' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async extractFile(@UploadedFile() file: any) {
    if (!file) {
      return { error: 'Vui lòng chọn file' };
    }

    let text = '';

    try {
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.docx') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (ext === '.pdf') {
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(file.buffer);
        text = result.text;
      } else if (ext === '.txt' || ext === '.json' || ext === '.yaml' || ext === '.yml') {
        text = file.buffer.toString('utf-8');
      } else {
        return { error: `Định dạng file ${ext} không được hỗ trợ. Chỉ hỗ trợ: .docx, .pdf, .txt, .json, .yaml` };
      }

      if (!text || text.trim().length === 0) {
        return { error: 'Không thể đọc nội dung từ file. File có thể bị rỗng hoặc bảo vệ.' };
      }

      this.logger.log(`Extracted ${text.length} chars from ${file.originalname}`);

      const endpoints = await this.aiExtractService.extract(text);
      return { success: true, count: endpoints.length, endpoints };
    } catch (error: any) {
      this.logger.error(`AI extract error: ${error.message}`);
      return { error: error.message };
    }
  }
}
