import {  Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {

    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@User('id') userId: string) {
        const user = await this.userService.getFullUserById(userId);
        return user;
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateSelf(@User() currentUser, @Body() dto: UpdateUserDto) {
        return this.userService.updateUser(currentUser, currentUser.id, dto);
    }

    @Patch('profile/:id')
    @UseGuards(JwtAuthGuard)
    async updateUser(@User() currentUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.userService.updateUser(currentUser, id, dto);
    }
}
