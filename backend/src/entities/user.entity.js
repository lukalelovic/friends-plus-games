import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity({name: 'User'})
export class User {
    @PrimaryGeneratedColumn()
    id;

    @Column({type: 'varchar'})
    @Length(3, 20)
    userName;

    @Column({type: 'varchar'})
    @Length(5, 30)
    email;

    @Column({type: 'varchar'})
    @Length(7, 30)
    password;
}