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
    private bookingsRepository: Repository<Booking>,
    private ridesService: RidesService,
  ) {}

  async create(createBookingDto: CreateBookingDto, passengerId: string): Promise<Booking> {
    const ride = await this.ridesService.findOne(createBookingDto.rideId);

    if (ride.availableSeats < createBookingDto.seatsBooked) {
      throw new BadRequestException('Not enough available seats');
    }

    const totalPrice = Number(ride.pricePerSeat) * createBookingDto.seatsBooked;

    // CORRECTION TS2769 & DeepPartial : On construit l'objet proprement en respectant le typage de l'entité
    const booking = this.bookingsRepository.create({
      seatsBooked: createBookingDto.seatsBooked,
      totalPrice,
      status: (createBookingDto as any).status || 'pending',
      ride: { id: createBookingDto.rideId } as any,
      passenger: { id: passengerId } as any,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    // CORRECTION TS2339 : savedBooking est bien un objet Booking unique ici
    if (savedBooking.status === 'confirmed') {
      await this.ridesService.updateAvailableSeats(
        createBookingDto.rideId,
        -createBookingDto.seatsBooked,
      );
    }

    return savedBooking;
  }

  async findAll(passengerId?: string): Promise<Booking[]> {
    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.ride', 'ride')
      .leftJoinAndSelect('booking.passenger', 'passenger')
      .leftJoinAndSelect('ride.driver', 'driver');

    if (passengerId) {
      queryBuilder.andWhere('passenger.id = :passengerId', { passengerId });
    }

    return queryBuilder.orderBy('booking.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Booking> {
    // CORRECTION TS2559 : Remplacement du tableau de chaînes par un objet de relations fortement typé
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
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status === status) {
      return booking;
    }

    if (booking.status === 'confirmed' && status === 'cancelled') {
      await this.ridesService.updateAvailableSeats(booking.ride.id, booking.seatsBooked);
    }

    if (booking.status === 'pending' && status === 'confirmed') {
      await this.ridesService.updateAvailableSeats(booking.ride.id, -booking.seatsBooked);
    }

    booking.status = status as any;
    return this.bookingsRepository.save(booking);
  }
}