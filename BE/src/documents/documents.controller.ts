import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { DocumentsService } from './documents.service';
import { ProjectPermissionDto } from './dto/project-permission.dto';
import { EndpointPermissionDto } from './dto/endpoint-permission.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('api')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách API documents' })
  getDocuments(@Req() req: Request): any {
    const user = (req as Request & { user?: Record<string, unknown> }).user;
    return this.documentsService.getDocuments(user);
  }

  @Post('admin/project-permission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gỡ/gán quyền project cho đối tác' })
  setProjectPermission(@Body() body: ProjectPermissionDto): any {
    return this.documentsService.setProjectPermission(
      body.partnerId,
      body.projectId,
      body.hasPermission,
    );
  }

  @Post('admin/endpoint-permission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gỡ/gán quyền endpoint cho đối tác' })
  setEndpointPermission(@Body() body: EndpointPermissionDto): any {
    return this.documentsService.setEndpointPermission(
      body.partnerId,
      body.endpointId,
      body.hasPermission,
    );
  }

  @Post('documents/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upload endpoints từ file JSON của đối tác' })
  uploadDocuments(@Body() body: UploadDocumentDto): any {
    return this.documentsService.uploadEndpoints(body.endpoints);
  }

  @Get('documents/uploaded')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách endpoints đã upload' })
  getUploadedEndpoints(): any {
    return this.documentsService.getUploadedEndpoints();
  }
}
