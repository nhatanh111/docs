import { Module } from '@nestjs/common';
import { AiExtractController } from './ai-extract.controller';
import { AiExtractService } from './ai-extract.service';

@Module({
  controllers: [AiExtractController],
  providers: [AiExtractService],
})
export class AiExtractModule {}
