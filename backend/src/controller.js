import { Controller, Dependencies, Get } from '@nestjs/common';
import { UserService } from './service';

@Controller()
@Dependencies(UserService)
export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    @Get()
    getUsers() {
        return this.userService.findAll();   
    }
}