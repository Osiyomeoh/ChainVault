import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('users')
  @UseGuards(JwtAuthGuard)
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get('profile')
    async getProfile(@Request() req) {
      return this.usersService.findById(req.user.id);
    }
  
    @Patch('profile')
    async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
      return this.usersService.update(req.user.id, updateUserDto);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.usersService.findById(id);
    }
  
    @Delete('profile')
    async removeProfile(@Request() req) {
      return this.usersService.remove(req.user.id);
    }
  }