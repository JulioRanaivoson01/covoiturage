# Configuration Instructions

## 1. Install Dependencies

Run the following command to install all required packages:

```bash
npm install @nestjs/typeorm typeorm pg bcryptjs @nestjs/jwt @nestjs/passport passport passport-jwt passport-local class-validator class-transformer uuid
npm install --save-dev @types/bcryptjs @types/passport-jwt @types/passport-local
```

## 2. Configure Module Files

### rides.module.ts
Replace the content with:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride])],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
```

### bookings.module.ts
Replace the content with:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
```

### auth.module.ts
Replace the content with:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // TODO: Move to environment variable
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## 3. Configure app.module.ts

Replace the content with:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RidesModule } from './rides/rides.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Ride } from './rides/entities/ride.entity';
import { Booking } from './bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'covoiturage',
      entities: [User, Ride, Booking],
      synchronize: true, // TODO: Set to false in production
    }),
    AuthModule,
    RidesModule,
    BookingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 4. Configure CORS in main.ts

Replace the content with:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*', // TODO: Replace with your React Native app URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3000);
}
bootstrap();
```

## 5. Environment Variables

Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=covoiturage
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
```

## 6. Database Setup

Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE covoiturage;
```

## 7. Run the Application

```bash
npm run start:dev
```

## API Endpoints

### Auth
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login and get JWT token

### Rides
- POST `/rides` - Create a new ride (requires JWT)
- GET `/rides` - Search rides (public, supports query params: departure, arrival, date)
- GET `/rides/:id` - Get ride details

### Bookings
- POST `/bookings` - Create a booking (requires JWT)
- GET `/bookings` - Get user's bookings (requires JWT)
- GET `/bookings/:id` - Get booking details (requires JWT)
- PATCH `/bookings/:id/status` - Update booking status (requires JWT)
