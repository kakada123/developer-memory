import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = !origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === 'file://';
      callback(allowed ? null : new Error('Origin is not allowed'), allowed);
    },
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(47821, '127.0.0.1');
}

void bootstrap();
