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

    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      ride: { id: createBookingDto.rideId },
      passenger: { id: passengerId },
      totalPrice,
      status: createBookingDto.status || 'pending',
    });

    const savedBooking = await this.bookingsRepository.save(booking);

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
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['ride', 'passenger', 'ride.driver'],
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
