import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsModule } from '../transports/nats.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    NatsModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
