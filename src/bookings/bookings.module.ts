// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity'; // Vérifiez le chemin selon vos fichiers
import { RidesModule } from '../rides/rides.module'; // Indispensable pour lier RidesService

@Module({
  imports: [
    // On donne l'accès à l'entité Booking pour ce module
    TypeOrmModule.forFeature([Booking]),
    
    // On importe le module des trajets pour que BookingsService puisse vérifier les places disponibles
    RidesModule, 
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}