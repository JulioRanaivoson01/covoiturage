import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createRideDto: CreateRideDto, @Request() req) {
    return this.ridesService.create(createRideDto, req.user.id);
  }
   @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => (Math.round(Math.random() * 16)).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return {
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/${file.filename}`,
    };
  }
  @Get()
  async findAll(
    @Query('departure') departure?: string,
    @Query('arrival') arrival?: string,
    @Query('date') date?: string,
  ) {
    return this.ridesService.findAll({ departure, arrival, date });
  }

  // 🌟 1. ON PLACE LA ROUTE STATIQUE EN PREMIER
  @Get('driver/me')
  @UseGuards(JwtAuthGuard)
  async findByDriver(@Request() req) {
    return this.ridesService.findByDriver(req.user.id);
  }

  // 🌟 2. ON PLACE LA ROUTE DYNAMIQUE EN DERNIER (Et correction de @Query en @Param pour l'id)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }
  
}