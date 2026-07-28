import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndpointPermissionDto {
  @ApiProperty({ example: 'pt-1' })
  @IsString()
  partnerId: string;

  @ApiProperty({ example: 'ep-moto-calc' })
  @IsString()
  endpointId: string;

  @ApiProperty()
  @IsBoolean()
  hasPermission: boolean;
}
