import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: (
      process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173'
    ).split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.' },
  });
  app.use('/api/auth/login', loginLimiter);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PVI Portal API')
    .setDescription('API documentation for PVI Portal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 Server running on port ${port}`);
  logger.log(`📖 Swagger: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
  // Log and exit if bootstrap fails

  console.error('Bootstrap failed:', err);
  process.exit(1);
});
