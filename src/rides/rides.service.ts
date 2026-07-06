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

  async create(createRideDto: CreateRideDto, driverId: string): Promise<Ride> {
    const ride = this.ridesRepository.create({
      ...createRideDto,
      driver: { id: driverId },
      availableSeats: createRideDto.totalSeats,
      departureTime: new Date(createRideDto.departureTime),
    });
    return this.ridesRepository.save(ride);
  }

  async findAll(filters?: {
    departure?: string;
    arrival?: string;
    date?: string;
  }): Promise<Ride[]> {
    const queryBuilder = this.ridesRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.driver', 'driver')
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
}