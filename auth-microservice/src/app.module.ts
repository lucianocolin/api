import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/auth-ms-db'),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
