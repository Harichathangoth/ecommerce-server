import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('E-Commerce Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Register Fastify Cookie Plugin
  await app.register(fastifyCookie as any, {
    secret: process.env.COOKIE_SECRET || 'e-com_cookie_secret_2026',
  });

  // Base API Prefix
  app.setGlobalPrefix('api');

  // Native NestJS URI Versioning (v1, v2, v3, etc.)
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent and received
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register Global Interceptors & Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise E-Commerce API Engine')
    .setDescription('Multi-Branch Enterprise Electronics E-Commerce REST API Engine')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Enterprise E-Commerce API running on: http://localhost:${port}/api/v1`);
}

bootstrap();
