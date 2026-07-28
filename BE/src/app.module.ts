import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PartnersModule } from './partners/partners.module';
import { DocumentsModule } from './documents/documents.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { AiExtractModule } from './ai-extract/ai-extract.module';
import { User } from './users/user.entity';
import { Partner } from './partners/partner.entity';
import { seedDatabase } from './database/seed';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.get<string>('DATABASE_URL'),
        models: [User, Partner],
        autoLoadModels: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    PartnersModule,
    DocumentsModule,
    SandboxModule,
    AiExtractModule,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await seedDatabase();
  }
}
