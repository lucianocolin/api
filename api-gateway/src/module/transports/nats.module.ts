import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const NATS_SERVICE = 'NATS_SERVICE';

const clientsModule = ClientsModule.register([
  {
    name: NATS_SERVICE,
    transport: Transport.NATS,
    options: {
      servers: 'nats://localhost:4222',
    },
  },
]);

@Module({
  imports: [clientsModule],
  exports: [clientsModule],
})
export class NatsModule {}
