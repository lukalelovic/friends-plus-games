import { Injectable, Dependencies } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
@Dependencies(getRepositoryToken(User))
export class UserService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }

    findAll() {
        return this.usersRepository.find();
    }

    findOne(id) {
        return this.usersRepository.findOne(id);
    }

    async remove(id) {
        await this.usersRepository.delete(id);
    }
}