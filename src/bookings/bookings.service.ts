// src/bookings/bookings.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RidesService } from '../rides/rides.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    // Injecté grâce à l'import de RidesModule dans bookings.module.ts
    private readonly ridesService: RidesService,
  ) {}

  // 1. CRÉER UNE RÉSERVATION
  async create(createBookingDto: CreateBookingDto, passengerId: string): Promise<Booking> {
    // Si ta clé s'appelle autrement dans ton DTO (ex: seats ou seatsRequested), aligne-la ici
    const { rideId, seatsBooked } = createBookingDto;

    // Récupère le trajet pour vérifier la disponibilité des places
    const ride = await this.ridesService.findOne(rideId);

    if (ride.availableSeats < seatsBooked) {
      throw new BadRequestException('Pas assez de places disponibles pour ce trajet.');
    }

    // Instanciation manuelle et sécurisée pour éviter l'erreur de surcharge TypeORM (Overload)
    const booking = new Booking();
    booking.passenger = { id: passengerId } as any;
    booking.ride = { id: rideId } as any;
    booking.seatsBooked = seatsBooked;
    booking.status = 'pending' as any; // Casté en as any pour s'aligner sur ton BookingStatus (enum)

    const savedBooking = await this.bookingsRepository.save(booking);

    // Met à jour le nombre de places restantes dans le trajet (on déduit)
    await this.ridesService.updateAvailableSeats(rideId, -seatsBooked);

    return savedBooking;
  }

  // 2. RÉCUPÉRER TOUTES LES RÉSERVATIONS D'UN UTILISATEUR
  async findAll(userId: string): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: {
        passenger: { id: userId }, // Filtre les réservations de l'utilisateur connecté
      },
      relations: {
        ride: {
          driver: true, // Charge le trajet et le conducteur pour l'affichage de l'écran mobile
        },
      },
      order: {
        createdAt: 'DESC', // Les plus récentes en premier
      },
    });
  }

  // 3. TROUVER UNE RÉSERVATION UNIQUE
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: {
        ride: {
          driver: true,
        },
        passenger: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`La réservation avec l'ID ${id} n'existe pas.`);
    }

    return booking;
  }

  // 4. METTRE À JOUR LE STATUT (Accepté, Refusé, Annulé)
  async updateStatus(id: string, status: any): Promise<Booking> {
    const booking = await this.findOne(id);
    
    // Si la réservation est annulée, on recrédite les places sur le trajet
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await this.ridesService.updateAvailableSeats(booking.ride.id, booking.seatsBooked);
    }

    booking.status = status;
    return await this.bookingsRepository.save(booking);
  }
}