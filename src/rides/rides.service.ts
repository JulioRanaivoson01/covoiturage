import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private ridesRepository: Repository<Ride>,
  ) {}
async create(createRideDto: CreateRideDto, userId: string) {
  const newRide = this.ridesRepository.create({
    departure: createRideDto.departure,
    arrival: createRideDto.arrival,
    departureTime: createRideDto.departureTime,
    pricePerSeat: createRideDto.pricePerSeat,
    totalSeats: createRideDto.totalSeats,
    availableSeats: createRideDto.totalSeats,
    carModel: createRideDto.carModel,
    luggageAllowed: createRideDto.luggageAllowed,
    description: createRideDto.description,
    // On force l'affectation ici :
    carImageUri: createRideDto.carImageUri, 
    driver: { id: userId },
  });

  return await this.ridesRepository.save(newRide);
}

  async findAll(filters?: {
    departure?: string;
    arrival?: string;
    date?: string;
  }): Promise<Ride[]> {
    const queryBuilder = this.ridesRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.driver', 'driver')
      .addSelect('ride.carImageUri')
      .where('ride.departureTime > :now', { now: new Date() })
      .andWhere('ride.availableSeats > :minSeats', { minSeats: 0 });

    if (filters?.departure) {
      queryBuilder.andWhere('ride.departure ILIKE :departure', {
        departure: `%${filters.departure}%`,
      });
    }

    if (filters?.arrival) {
      queryBuilder.andWhere('ride.arrival ILIKE :arrival', {
        arrival: `%${filters.arrival}%`,
      });
    }

    if (filters?.date) {
      const startDate = new Date(filters.date);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('ride.departureTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder.orderBy('ride.departureTime', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Ride> {
    // CORRECTION TS2559 : Utilisation d'un objet fortement typé à la place du tableau de chaînes
    const ride = await this.ridesRepository.findOne({
      where: { id },
      relations: {
        driver: true,
        bookings: true,
      },
    });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }
    return ride;
  }

  async updateAvailableSeats(rideId: string, seatsChange: number): Promise<Ride> {
    const ride = await this.findOne(rideId);
    const newAvailableSeats = ride.availableSeats + seatsChange;
    
    if (newAvailableSeats < 0) {
      throw new Error('Not enough available seats');
    }
    
    if (newAvailableSeats > ride.totalSeats) {
      throw new Error('Available seats cannot exceed total seats');
    }
    
    ride.availableSeats = newAvailableSeats;
    return this.ridesRepository.save(ride);
  }
  // 🌟 AJOUT DE LA MÉTHODE MANQUANTE
  async findByDriver(driverId: string): Promise<Ride[]> {
    return await this.ridesRepository.find({
      where: {
        driver: { id: driverId }, // Filtre en utilisant la relation avec le conducteur
      },
      relations: {
        // Optionnel : ajoute ici les relations si tu veux afficher 
        // les détails du conducteur ou des réservations sur l'écran "Mes Trajets"
        driver: true, 
      },
      order: {
        departureTime: 'DESC', // Les trajets les plus récents en premier
      },
    });
  }
}