import { Injectable } from '@nestjs/common';
import { Player } from '../../models/player';

@Injectable()
export class GameGateway {
  public static lobbyPlayerMap = new Map<string, Map<string, Player>>(); // Contains <lobbyId>:<player map>

  public static setPlayerMap(
    lobbyId: string,
    playerMap: Map<string, Player>,
  ): void {
    GameGateway.lobbyPlayerMap.set(lobbyId, playerMap);
  }
}
