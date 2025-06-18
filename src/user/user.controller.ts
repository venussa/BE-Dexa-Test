import {  Controller, Get, Patch, Param, Body, UseGuards, Post, Delete, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { User } from '@src/user/decorators/user.decorator';
import { UserService } from '@src/user/user.service';
import { UpdateUserDto } from '@src/user/dto/update-user.dto';
import { CreateUserDto } from '@src/user/dto/create-user.dto';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorator';

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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('edit/:id')
    async updateUser(@User() currentUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.userService.updateUser(currentUser, id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('create')
    async createUser(@Body() dto: CreateUserDto) {
       return this.userService.createUser(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Delete('delete/:id')
    async deleteUser(@User() currentUser, @Param('id') id: string) {
        return this.userService.deleteUser(currentUser, id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
    getAllUsers(@Query() query: any) {
        return this.userService.getAllUsers(query);
    }
}
