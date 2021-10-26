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
import { generateRandomGameId, getColors } from "../utils";
import { DEFAULT_STARTING_ROLES_COUNT } from '../../../client/src/utils/role-utils';
import { GameManager } from "./model";

export const appointLeader = (gameId: string, roomName: RoomName, appointerId: string, appointedLeaderId: string): void => {
  const gameManager = new GameManager(gameId);
  const targetRoom = gameManager.currentRound().round.rooms[roomName];
  if (targetRoom.leadersRecord.length === 0) {
    gameManager.addLeaderRecord(roomName, {
      method: LeaderRecordMethod.APPOINTMENT,
      leaderId: appointedLeaderId,
      appointerId,
    });
  }
}

export const createGame = (data: CreateGameEvent): void => {
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
  new GameManager(gameId).create(game);
};

export const incrementRoleInGame = (
  gameId: string,
  role: RoleKey,
  increment: number
): void => {
  new GameManager(gameId).update(game => {
    game.rolesCount[role] += increment;
  })
};

export const proposeRoomLeader = (
  gameId: string,
  roomName: RoomName,
  voterId: string,
  proposedLeaderId?: string
): void => {
  const gameManager = new GameManager(gameId)
  gameManager.updatePlayer(voterId, (player) => {
    if (proposedLeaderId) {
      player.leaderVote = {
        roomName,
        voterId,
        proposedLeaderId,
        timestamp: Date.now(),
      };
    } else {
      delete player.leaderVote
    }
  });
}

export const startGame = (
  gameId: string,
): void => {
  const gameManager = new GameManager(gameId);
  gameManager.assignInitialRoles();
  gameManager.assignInitialRooms();
  gameManager.update(game => {
    game.status = GameStatus.ONGOING;
    game.rounds[0].status = RoundStatus.ONGOING;
    game.currentTimerSeconds = game.rounds[0].timerSeconds;
  });
  gameManager.startTimer();
};
