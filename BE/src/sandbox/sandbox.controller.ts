import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SandboxService } from './sandbox.service';
import { ExecuteSandboxDto } from './dto/execute-sandbox.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Sandbox')
@Controller('api/sandbox')
@UseGuards(JwtAuthGuard)
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Gọi thử API sandbox (mock)' })
  execute(@Body() body: ExecuteSandboxDto): unknown {
    if (!body.endpointId) {
      return { status: 'error', message: 'Thiếu endpointId' };
    }
    return this.sandboxService.execute(body.endpointId, body.requestBody || {});
  }
}
