import { last, mapValues } from 'lodash';
import { CreateGameEvent } from "../../../client/src/types/event.types";
import {
  Game,
  GameStatus,
} from "../../../client/src/types/game.types";
import { ALL_ROLES, RoleKey } from '../../../client/src/types/role.types';
import { games, getGameById } from "../db";
import { generateRandomGameId, getColors } from "../utils";

export const incrementRoleInGame = (game: Game, role: RoleKey, increment: number): void => {
  game.roles.inPlay[role] += increment;
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
    roles: {
      inPlay: mapValues(ALL_ROLES, role => role.restrictions.roleMin),
      allocated: {}
    },
    status: GameStatus.LOBBY,
    rounds: []
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
    return game;
  } else {
    throw new Error("Couldn't find game");
  }
};
