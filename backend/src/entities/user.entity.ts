import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(3, 20)
  userName: string;

  @Column()
  @Length(5, 30)
  email: string;

  @Column()
  @Length(7, 30)
  password: string;
}
