import { CreateGameEvent } from "../../../client/src/types/event.types";
import {
  createStartingRounds,
  Game,
  GameStatus,
  LeaderRecordMethod,
  RoomName,
  RoundStatus,
} from "../../../client/src/types/game.types";
import { RoleKey } from '../../../client/src/types/role.types';
import { games, getGameById } from "../db";
import { generateRandomGameId, getColors } from "../utils";
import { DEFAULT_STARTING_ROLES_COUNT } from '../../../client/src/utils/role-utils';
import { assignPlayersToRooms, assignRolesToPlayers } from './utils';

export const appointLeader = (game: Game, roomName: RoomName, appointerId: string, appointedLeaderId: string): void => {
  const currentRound = game.rounds.find(round => round.status === RoundStatus.ONGOING);
  if (currentRound) {
    const targetRoom = currentRound.rooms[roomName];
    if (targetRoom.leadersRecord.length === 0) {
      targetRoom.leadersRecord.push({
        method: LeaderRecordMethod.APPOINTMENT,
        leaderId: appointedLeaderId,
        appointerId
      })
    }
  }
}

export const createGame = (data: CreateGameEvent): Game => {
  const gameId = generateRandomGameId();
  const game: Game = {
    id: gameId,
    actions: [],
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

export const incrementRoleInGame = (
  game: Game,
  role: RoleKey,
  increment: number
): void => {
  game.rolesCount[role] += increment;
};


export const startGame = (
  gameId: string,
): Game => {
  const game = getGameById(gameId);
  if (game) {
    game.status = GameStatus.ONGOING;
    assignRolesToPlayers(game.rolesCount, game.players);
    startFirstRound(game);
    return game;
  } else {
    throw new Error("Couldn't find game");
  }
};

export const startFirstRound = (game: Game): void => {
  const firstRound = game.rounds[0];
  firstRound.playerAllocation = assignPlayersToRooms(Object.keys(game.players));
  firstRound.status = RoundStatus.ONGOING;
  game.currentTimerSeconds = firstRound.timerSeconds;
}
