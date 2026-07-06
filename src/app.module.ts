// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RidesModule } from './rides/rides.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    // Configuration pour lire le fichier .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Connexion à la base Neon PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true, 
      synchronize: true, // Crée les tables automatiquement dans Neon
      ssl: {
        rejectUnauthorized: false, // Obligatoire pour Neon Cloud
      },
    }),
    AuthModule,
    RidesModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}