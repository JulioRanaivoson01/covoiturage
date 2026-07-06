import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { LuggageAllowed } from '../entities/ride.entity';

export class CreateRideDto {
  @IsString()
  departure: string;

  @IsString()
  arrival: string;

  @IsDateString()
  departureTime: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  totalSeats: number;

  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @IsString()
  carModel: string;

  @IsEnum(LuggageAllowed)
  @IsOptional()
  luggageAllowed?: LuggageAllowed;

  @IsString()
  @IsOptional()
  description?: string;
}
