import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'newuser@pvi.com', description: 'Email tài khoản' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(3, { message: 'Mật khẩu tối thiểu 3 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: 'ĐỐI TÁC' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Mô tả tài khoản' })
  @IsOptional()
  @IsString()
  description?: string;
}
