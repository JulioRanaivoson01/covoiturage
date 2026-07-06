// src/rides/rides.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity'; // Vérifiez que le chemin est correct selon vos fichiers

@Module({
  imports: [
    // On donne l'accès à l'entité Ride pour ce module
    TypeOrmModule.forFeature([Ride]),
  ],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService], // TRÈS IMPORTANT : permet à BookingsModule de l'utiliser
})
export class RidesModule {}