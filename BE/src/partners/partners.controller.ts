import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Partners')
@ApiBearerAuth()
@Controller('api/admin/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đối tác' })
  findAll() {
    return this.partnersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đối tác mới' })
  create(@Body() body: CreatePartnerDto) {
    return this.partnersService.create(body);
  }

  @Put('update-status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đối tác' })
  updateStatus(@Body() body: UpdateStatusDto) {
    return this.partnersService.updateStatus(body.id, body.status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đối tác' })
  update(@Param('id') id: string, @Body() body: UpdatePartnerDto) {
    return this.partnersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đối tác' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
