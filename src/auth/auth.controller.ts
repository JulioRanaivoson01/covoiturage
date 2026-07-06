import { Controller, Post, Body } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // 🌟 Rend cette route accessible sans token JWT
  @Post('register')
  async register(@Body() body: any) {
    console.log('Register request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.email) {
      throw new Error('Email is required');
    }
    if (!body.password) {
      throw new Error('Password is required');
    }
    if (!body.firstName) {
      throw new Error('First name is required');
    }
    if (!body.lastName) {
      throw new Error('Last name is required');
    }
    if (!body.phoneNumber) {
      throw new Error('Phone number is required');
    }
    // 1. Si le frontend mobile envoie "phone", on le convertit en "phoneNumber"
    if (body.phone && !body.phoneNumber) {
      body.phoneNumber = body.phone;
    }

    // 2. Si le frontend n'envoie pas encore de "cinNumber", on met une valeur par défaut
    // pour éviter la contrainte NOT NULL de PostgreSQL
    if (!body.cinNumber) {
      body.cinNumber = 'PENDING';
    }

   

    // 4. On applique manuellement le type pour le passer en toute sécurité au service
    const registerDto = body as RegisterDto;

    return this.authService.register(registerDto);
  }

  @Public() // 🌟 Rend cette route accessible sans token JWT
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}