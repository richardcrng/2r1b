import { Socket as TClientSocket } from "socket.io-client";
import { Socket as TServerSocket, Server as TServer } from "socket.io";
import { Card, Game, Player, RoomName } from "./game.types";
import { RoleKey } from "./role.types";
import { GameNotification, PlayerNotification } from './notification.types';
import { PlayerAction } from "./player-action.types";

export type ClientSocket = TClientSocket<
  ServerEventListeners,
  ClientEventListeners
>;

export type ServerSocket = TServerSocket<
  ClientEventListeners,
  ServerEventListeners
>;

export type ServerIO = TServer<ClientEventListeners, ServerEventListeners>;

export enum ClientEvent {
  ALIAS_SOCKET = "alias-socket",
  APPOINT_ROOM_LEADER = 'appoint-room-leader',
  CREATE_GAME = "create-game",
  GET_GAME = "get-game",
  GET_PLAYER = "get-player",
  INCREMENT_ROLE = 'increment-role',
  JOIN_GAME = "join",
  FLIP_CARD = "flip-card",
  NEXT_ROUND = "next-round",
  OFFER_ABDICATION = 'offer-abdication',
  PROPOSE_ROOM_LEADER = 'propose-room-leader',
  RESET_GAME = 'reset-game',
  START_GAME = "start-game",
  SHOW_RESULTS = "show-results",
  UPDATE_PLAYER = "update-player",
}

export enum ServerEvent {
  ACTION_PENDING = 'action-pending',
  CARD_FLIPPED = 'card-picked',
  GAME_CREATED = "game-created",
  GAME_GOTTEN = "game-gotten",
  GAME_JOINED = "game-joined",
  GAME_NOT_FOUND = "game-not-found",
  GAME_NOTIFICATION = "game-notification",
  GAME_OVER = 'game-over',
  GAME_UPDATED = "game-updated",
  PLAYER_GOTTEN = "player-gotten",
  PLAYER_NOTIFICATION = 'player-notification',
  PLAYER_NOT_FOUND = "player-not-found",
  PLAYER_UPDATED = "player-updated",
  REDIRECT_TO_LOBBY = "redirect-to-lobby",
  RESULTS_SHOWN = "results-shown",
  ROLE_AND_ROOM_ALLOCATIONS_MADE = 'role-and-room-allocations-made',
  ROUND_STARTED = 'round-started',
}

export enum GameOverReason {
  ALL_GOLD_FLIPPED = 'The adventurers found all the gold',
  ALL_FIRE_FLIPPED = 'The adventurers ran into all the fire',
  ALL_ROUNDS_FINISHED = 'The adventurers lost on time'
}

/**
 * Listeners for `ClientEvent`s
 */
export type ClientEventListeners = {
  [ClientEvent.OFFER_ABDICATION]: (
    gameId: string,
    roomName: RoomName,
    abdicaterId: string,
    proposedLeaderId: string
  ) => void;

  [ClientEvent.APPOINT_ROOM_LEADER]: (
    gameId: string,
    roomName: RoomName,
    appointerId: string,
    appointedLeaderId: string
  ) => void;

  [ClientEvent.CREATE_GAME]: (e: CreateGameEvent) => void;

  [ClientEvent.FLIP_CARD]: (
    gameId: string,
    keyholderId: string,
    targetPlayerId: string,
    cardIdx: number,
    card: Card
  ) => void;

  [ClientEvent.GET_GAME]: (gameId: string) => void;

  [ClientEvent.GET_PLAYER]: (
    gameId: string,
    playerId: string,
    aliasIds: string[]
  ) => void;

  [ClientEvent.INCREMENT_ROLE]: (
    gameId: string,
    roleKey: RoleKey,
    increment: number
  ) => void;

  [ClientEvent.JOIN_GAME]: (gameId: string, player: Player) => void;
  [ClientEvent.NEXT_ROUND]: (gameId: string) => void;

  [ClientEvent.PROPOSE_ROOM_LEADER]: (
    gameId: string,
    roomName: RoomName,
    proposerId: string,
    proposedLeaderId?: string
  ) => void;

  [ClientEvent.RESET_GAME]: (gameId: string) => void;
  [ClientEvent.SHOW_RESULTS]: (gameId: string) => void;
  [ClientEvent.START_GAME]: (gameId: string) => void;
  [ClientEvent.UPDATE_PLAYER]: (gameId: string, player: Player) => void;
};

/**
 * Listeners for `ServerEvent`s
 */
export type ServerEventListeners = {
  [ServerEvent.ACTION_PENDING]: (
    playerId: string,
    action: PlayerAction
  ) => void;
  [ServerEvent.CARD_FLIPPED]: (
    gameId: string,
    keyholderId: string,
    targetPlayerId: string,
    cardIdx: number,
    card: Card
  ) => void;
  [ServerEvent.GAME_CREATED]: (game: Game) => void;
  [ServerEvent.GAME_OVER]: (
    gameId: string,
    reason: GameOverReason,
    game: Game
  ) => void;
  [ServerEvent.GAME_GOTTEN]: (gameId: string, game: Game) => void;
  [ServerEvent.GAME_JOINED]: (e: GameJoinedEvent) => void;
  [ServerEvent.GAME_NOTIFICATION]: (
    gameId: string,
    notification: GameNotification
  ) => void;
  [ServerEvent.GAME_NOT_FOUND]: () => void;
  [ServerEvent.GAME_UPDATED]: (gameId: string, game: Game) => void;
  [ServerEvent.PLAYER_GOTTEN]: (playerId: string, player: Player) => void;
  [ServerEvent.PLAYER_UPDATED]: (playerId: string, player: Player) => void;
  [ServerEvent.PLAYER_NOTIFICATION]: (
    playersToNotify: Record<string, true>,
    notification: PlayerNotification
  ) => void;
  [ServerEvent.PLAYER_NOT_FOUND]: () => void;
  [ServerEvent.REDIRECT_TO_LOBBY]: () => void;
  [ServerEvent.RESULTS_SHOWN]: (gameId: string) => void;
  [ServerEvent.ROLE_AND_ROOM_ALLOCATIONS_MADE]: (gameId: string) => void;
  [ServerEvent.ROUND_STARTED]: (gameId: string) => void;
};

export interface CreateGameEvent {
  playerName?: string;
  socketId: string;
}

export interface JoinGameEvent {
  playerName: string;
  socketId: string;
  gameId: Game["id"];
}

export interface GameJoinedEvent {
  game: Game;
}