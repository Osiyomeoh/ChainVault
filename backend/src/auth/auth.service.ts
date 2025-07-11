import {
    Injectable,
    UnauthorizedException,
    ConflictException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcryptjs';
  import { UsersService } from '../users/users.service';
  import { CreateUserDto } from '../users/dto/create-user.dto';
  import { LoginDto } from './dto/login.dto';
  import { User } from '../users/entities/user.entity';
  
  @Injectable()
  export class AuthService {
    constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
    ) {}
  
    async validateUser(email: string, password: string): Promise<any> {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const { passwordHash, ...result } = user;
      return result;
    }
  
    async register(createUserDto: CreateUserDto) {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(createUserDto.password, salt);
  
      // Create user
      const user = await this.usersService.create({
        ...createUserDto,
        passwordHash,
      });
  
      // Generate JWT token
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
  
      const { passwordHash: _, ...userResponse } = user;
      
      return {
        user: userResponse,
        token,
      };
    }
  
    async login(loginDto: LoginDto) {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
  
      return {
        user,
        token,
      };
    }
  
    async getProfile(userId: string): Promise<User> {
      return this.usersService.findById(userId);
    }
  }
  