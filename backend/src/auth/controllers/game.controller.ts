import { Controller, Get } from '@nestjs/common';
import { Game } from 'src/auth/entities/game.entity';
import { GameService } from 'src/auth/services/game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('all')
  async findAllGames(): Promise<Game[]> {
    return this.gameService.findAll();
  }
}
