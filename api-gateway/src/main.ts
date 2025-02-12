import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from './common/exceptions/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
