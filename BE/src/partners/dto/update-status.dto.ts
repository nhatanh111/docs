import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: 'pt-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'active' })
  @IsString()
  status: string;
}
