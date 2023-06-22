import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity({ name: 'Game' })
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(3, 20)
  title: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', nullable: true })
  gameImage: string;

  @Column()
  isExternal: boolean;

  @Column({ type: 'varchar', nullable: true })
  externalURL: string;

  @Column('simple-array', { nullable: true })
  platforms: string[];
}
