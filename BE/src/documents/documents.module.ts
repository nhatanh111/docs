import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ApiDocument } from './document.entity';
import { ApiEndpoint } from './endpoint.entity';

@Module({
  imports: [SequelizeModule.forFeature([ApiDocument, ApiEndpoint])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
