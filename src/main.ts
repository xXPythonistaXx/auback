/* eslint-disable @typescript-eslint/no-floating-promises */
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { validationExceptionTransform } from '@shared/exceptions';
import {
  AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  MongoExceptionFilter,
  UnauthorizedExceptionFilter,
} from '@shared/filters';
import { AppModule } from './modules/app.module';
import { CONFIG } from './config/configuration.enum';
import { QueryParamsFilterInterceptor } from '@shared/interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as PackageJson from '../package.json';
import { json } from 'express';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle(PackageJson.name)
    .setDescription(PackageJson.description)
    .setVersion(PackageJson.version)
    .build();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>(CONFIG.PORT);
  const httpAdapter = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationExceptionTransform,
    }),
  );
  app.useGlobalFilters(
    new BadRequestExceptionFilter(),
    new AllExceptionsFilter(httpAdapter),
    new ForbiddenExceptionFilter(httpAdapter),
    new MongoExceptionFilter(httpAdapter),
    new UnauthorizedExceptionFilter(httpAdapter),
  );
  app.use(json({ limit: '20mb' }));
  app.useGlobalInterceptors(new QueryParamsFilterInterceptor());

  app.enableCors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(
      `App is running on: ${process.env.API_HOST}:${port}/api
      ${process.env.NODE_ENV ? process.env.NODE_ENV : 'production'} mode`,
    ),
  );
}
bootstrap();
