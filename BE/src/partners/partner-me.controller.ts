import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PartnersService } from './partners.service';

@ApiTags('Partners')
@ApiBearerAuth()
@Controller('api/partners')
export class PartnerMeController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin đối tác hiện tại (kèm phân quyền)' })
  async getMe(@Req() req: Request) {
    const user = (req as any).user;
    const partner = await this.partnersService.findByAccountId(user.id);
    if (!partner) return null;
    return partner;
  }
}
