import { Controller, Dependencies, Injectable, Get } from '@nestjs/common';
import { UserService } from './service';

@Controller()
@Injectable()
@Dependencies(UserService)
export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    @Get()
    getUsers() {
        return this.userService.getAll();   
    }
}