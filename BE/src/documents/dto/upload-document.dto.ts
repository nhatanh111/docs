import { IsString, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UploadEndpointField {
  @ApiProperty({ example: 'deviceTypeCode' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'String' })
  @IsString()
  type: string;

  @ApiProperty({ example: true })
  required: boolean;

  @ApiProperty({ example: 'Loại thiết bị' })
  @IsString()
  description: string;
}

class UploadEndpoint {
  @ApiProperty({ example: 'api-aqua-fee-quote' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Bảo hiểm Thiết bị điện tử AQUA' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'POST' })
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  method: string;

  @ApiProperty({ example: '/api/v1/pvi/fee-quotes/bao-hiem-thiet-bi-dien-tu' })
  @IsString()
  path: string;

  @ApiProperty({ example: 'Tính phí bảo hiểm thiết bị điện tử' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Tính phí bảo hiểm thiết bị điện tử AQUA' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  requestSample?: any;

  @ApiPropertyOptional()
  @IsOptional()
  responseFormat?: any;

  @ApiPropertyOptional({ type: [UploadEndpointField] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadEndpointField)
  fields?: UploadEndpointField[];
}

export class UploadDocumentDto {
  @ApiProperty({ type: [UploadEndpoint] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadEndpoint)
  endpoints: UploadEndpoint[];
}
