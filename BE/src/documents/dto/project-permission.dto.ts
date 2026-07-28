import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectPermissionDto {
  @ApiProperty({ example: 'pt-1' })
  @IsString()
  partnerId: string;

  @ApiProperty({ example: 'project-pvi-retail' })
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsBoolean()
  hasPermission: boolean;
}
