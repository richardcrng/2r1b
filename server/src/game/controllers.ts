import { CreateGameEvent } from "../../../client/src/types/event.types";
import {
  createStartingRounds,
  Game,
  GameStatus,
  RoundStatus,
} from "../../../client/src/types/game.types";
import { RoleKey } from '../../../client/src/types/role.types';
import { games, getGameById } from "../db";
import { generateRandomGameId, getColors } from "../utils";
import { DEFAULT_STARTING_ROLES_COUNT } from '../../../client/src/utils/role-utils';
import { assignPlayersToRooms } from './utils';

export const incrementRoleInGame = (game: Game, role: RoleKey, increment: number): void => {
  game.rolesCount[role] += increment;
}

export const createGame = (data: CreateGameEvent): Game => {
  const gameId = generateRandomGameId();
  const game: Game = {
    id: gameId,
    players: {
      [data.socketId]: {
        name: data.playerName,
        socketId: data.socketId,
        isHost: true,
        gameId,
        colors: getColors(5)
      },
    },
    rolesCount: { ...DEFAULT_STARTING_ROLES_COUNT },
    status: GameStatus.LOBBY,
    rounds: createStartingRounds()
  };
  games[gameId] = game;
  return game;
};

export const startGame = (
  gameId: string,
): Game => {
  const game = getGameById(gameId);
  if (game) {
    game.status = GameStatus.ONGOING;
    const roomAllocation = assignPlayersToRooms(Object.keys(game.players));
    const firstRound = game.rounds[0]
    firstRound.playerAllocation = roomAllocation;
    firstRound.status = RoundStatus.ONGOING;
    game.currentTimerSeconds = firstRound.timerSeconds;
    return game;
  } else {
    throw new Error("Couldn't find game");
  }
};
