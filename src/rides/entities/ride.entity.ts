import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum LuggageAllowed {
  NONE = 'none',
  SMALL = 'small',
  LARGE = 'large',
}

export enum TripStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  departure: string;

  @Column()
  arrival: string;

  @Column()
  departureTime: Date;

  @Column()
  totalSeats: number;

  @Column()
  availableSeats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerSeat: number;

  @Column()
  carModel: string;

  @Column({
    type: 'enum',
    enum: LuggageAllowed,
    default: LuggageAllowed.SMALL,
  })
  luggageAllowed: LuggageAllowed;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true }) 
  carImageUri: string;

  @ManyToOne(() => User, (user) => user.rides)
  driver: User;

  @OneToMany(() => Booking, (booking) => booking.ride)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
