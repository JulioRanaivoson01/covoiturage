import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createRideDto: CreateRideDto, @Request() req) {
    return this.ridesService.create(createRideDto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('departure') departure?: string,
    @Query('arrival') arrival?: string,
    @Query('date') date?: string,
  ) {
    return this.ridesService.findAll({ departure, arrival, date });
  }

  @Get(':id')
  async findOne(@Query('id') id: string) {
    return this.ridesService.findOne(id);
  }
}
