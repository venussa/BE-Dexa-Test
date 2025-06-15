import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/guards/roles.guard';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
