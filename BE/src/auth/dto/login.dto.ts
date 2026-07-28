import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@pvi.com', description: 'Email tài khoản' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password: string;
}
