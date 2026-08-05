import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Logger,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiExtractService } from './ai-extract.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as mammoth from 'mammoth';
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
  @ApiOperation({
    summary:
      'Upload file tài liệu (DOCX/PDF/TXT) để AI trích xuất API endpoints',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async extractFile(@UploadedFile() file: unknown) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }
    const f = file as {
      originalname?: unknown;
      originalName?: unknown;
      buffer?: unknown;
    };

    let text = '';

    try {
      const originalName =
        typeof f.originalname === 'string'
          ? f.originalname
          : typeof f.originalName === 'string'
            ? f.originalName
            : 'uploaded';
      const ext = path.extname(String(originalName)).toLowerCase();

      const buf = Buffer.isBuffer(f.buffer) ? f.buffer : null;

      if (
        !buf &&
        ['.docx', '.pdf', '.txt', '.json', '.yaml', '.yml'].indexOf(ext) === -1
      ) {
        throw new BadRequestException('Không thể đọc file hoặc file không có nội dung');
      }

      if (ext === '.docx') {
        const result = (await mammoth.extractRawText({
          buffer: buf as Buffer,
        })) as unknown;
        text =
          result && typeof (result as { value?: unknown }).value === 'string'
            ? (result as { value: string }).value
            : '';
      } else if (ext === '.pdf') {
        const pdfModule = await import('pdf-parse');
        const pdfParse =
          (pdfModule as { default?: unknown }).default ?? pdfModule;
        if (typeof pdfParse !== 'function') {
          throw new BadRequestException('pdf-parse module does not export a function');
        }
        const pdfResult = await (pdfParse as (b: Buffer) => Promise<unknown>)(
          buf as Buffer,
        );
        text =
          pdfResult &&
          typeof (pdfResult as { text?: unknown }).text === 'string'
            ? (pdfResult as { text: string }).text
            : '';
      } else if (
        ext === '.txt' ||
        ext === '.json' ||
        ext === '.yaml' ||
        ext === '.yml'
      ) {
        text = buf ? buf.toString('utf-8') : '';
      } else {
        throw new BadRequestException(
          'File format not supported. Supported: .docx, .pdf, .txt, .json, .yaml',
        );
      }

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('Cannot read content from file (empty or protected).');
      }

      this.logger.log(`Extracted ${text.length} chars from ${originalName}`);

      const endpoints = await this.aiExtractService.extract(text);
      return { success: true, count: endpoints.length, endpoints };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`AI extract error: ${msg}`);
      throw new BadRequestException(msg);
    }
  }
}
