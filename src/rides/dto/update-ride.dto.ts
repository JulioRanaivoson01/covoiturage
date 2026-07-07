import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { LuggageAllowed, TripStatus } from '../entities/ride.entity';

export class UpdateRideDto {
  @IsString()
  @IsOptional()
  departure?: string;

  @IsString()
  @IsOptional()
  arrival?: string;

  @IsDateString()
  @IsOptional()
  departureTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  totalSeats?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerSeat?: number;

  @IsString()
  @IsOptional()
  carModel?: string;

  @IsEnum(LuggageAllowed)
  @IsOptional()
  luggageAllowed?: LuggageAllowed;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  carImageUri?: string;

  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus;
}

