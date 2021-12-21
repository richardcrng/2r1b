import { Socket as TClientSocket } from "socket.io-client";
import { Socket as TServerSocket, Server as TServer } from "socket.io";
import {
  GamblerPrediction,
  Game,
  GameSettings,
  Player,
  RoomName,
} from "./game.types";
import { RoleKey } from "./role.types";
import { GameNotification, PlayerNotification } from "./notification.types";
import {
  PlayerAction,
  PlayerActionAbdicationOffered,
  PlayerActionShareOffered,
  PlayerActionShareResultReceived,
} from "./player-action.types";

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
  ACCEPT_ABDICATION = "accept-abdication",
  ACCEPT_SHARE = "accept-share",
  APPOINT_ROOM_LEADER = "appoint-room-leader",
  CREATE_GAME = "create-game",
  DECLINE_ABDICATION = "decline-abdication",
  DECLINE_SHARE = "decline-share",
  DESELECT_HOSTAGE = "deselect-hostage",
  GAMBLER_PREDICT = "gambler-predict",
  GET_GAME = "get-game",
  GET_PLAYER = "get-player",
  INCREMENT_ROLE = "increment-role",
  JOIN_GAME = "join",
  KICK_PLAYER = "kick-player",
  OFFER_ABDICATION = "offer-abdication",
  OFFER_SHARE = "offer-share",
  PRIVATE_EYE_PREDICT = "private-eye-predict",
  PROPOSE_ROOM_LEADER = "propose-room-leader",
  RESET_GAME = "reset-game",
  REVEAL_RESULTS = "reveal-results",
  SELECT_HOSTAGE = "select-hostage",
  SNIPER_SHOT = "sniper-shot",
  START_GAME = "start-game",
  SUBMIT_HOSTAGES = "submit-hostages",
  TERMINATE_SHARE = "terminate-share",
  UPDATE_PLAYER = "update-player",
  UPDATE_GAME_SETTINGS = "update-game-settingS",
  WITHDRAW_ABDICATION_OFFER = "withdraw-abdication-offer",
  WITHDRAW_SHARE_OFFER = "withdraw-share-offer",
}

export enum ServerEvent {
  ACTION_PENDING = "action-pending",
  ACTION_RESOLVED = "action-resolved",
  GAME_CREATED = "game-created",
  GAME_GOTTEN = "game-gotten",
  GAME_JOINED = "game-joined",
  GAME_NOT_FOUND = "game-not-found",
  GAME_NOTIFICATION = "game-notification",
  GAME_OVER = "game-over",
  GAME_UPDATED = "game-updated",
  PLAYER_GOTTEN = "player-gotten",
  PLAYER_KICKED = "player-kicked",
  PLAYER_NOTIFICATION = "player-notification",
  PLAYER_NOT_FOUND = "player-not-found",
  PLAYER_UPDATED = "player-updated",
  REDIRECT_TO_LOBBY = "redirect-to-lobby",
  RESULTS_SHOWN = "results-shown",
  ROLE_AND_ROOM_ALLOCATIONS_MADE = "role-and-room-allocations-made",
  ROUND_STARTED = "round-started",
}

export enum GameOverReason {
  ALL_GOLD_FLIPPED = "The adventurers found all the gold",
  ALL_FIRE_FLIPPED = "The adventurers ran into all the fire",
  ALL_ROUNDS_FINISHED = "The adventurers lost on time",
}

/**
 * Listeners for `ClientEvent`s
 */
export type ClientEventListeners = {
  [ClientEvent.ACCEPT_ABDICATION]: (
    gameId: string,
    action: PlayerActionAbdicationOffered
  ) => void;

  [ClientEvent.ACCEPT_SHARE]: (
    gameId: string,
    action: PlayerActionShareOffered
  ) => void;

  [ClientEvent.APPOINT_ROOM_LEADER]: (
    gameId: string,
    roomName: RoomName,
    appointerId: string,
    appointedLeaderId: string
  ) => void;

  [ClientEvent.CREATE_GAME]: (socketId: string, playerName?: string) => void;

  [ClientEvent.DECLINE_ABDICATION]: (
    gameId: string,
    action: PlayerActionAbdicationOffered
  ) => void;

  [ClientEvent.DECLINE_SHARE]: (
    gameId: string,
    action: PlayerActionShareOffered
  ) => void;

  [ClientEvent.DESELECT_HOSTAGE]: (
    gameId: string,
    playerId: string,
    roomName: RoomName
  ) => void;

  [ClientEvent.GAMBLER_PREDICT]: (
    gameId: string,
    prediction: GamblerPrediction
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

  [ClientEvent.KICK_PLAYER]: (gameId: string, playerId: string) => void;

  [ClientEvent.OFFER_ABDICATION]: (
    gameId: string,
    roomName: RoomName,
    abdicaterId: string,
    proposedLeaderId: string
  ) => void;

  [ClientEvent.OFFER_SHARE]: (
    gameId: string,
    action: PlayerActionShareOffered
  ) => void;

  [ClientEvent.PRIVATE_EYE_PREDICT]: (
    gameId: string,
    rolePrediction: RoleKey
  ) => void;

  [ClientEvent.PROPOSE_ROOM_LEADER]: (
    gameId: string,
    roomName: RoomName,
    proposerId: string,
    proposedLeaderId?: string
  ) => void;

  [ClientEvent.RESET_GAME]: (gameId: string) => void;

  [ClientEvent.REVEAL_RESULTS]: (gameId: string) => void;

  [ClientEvent.SELECT_HOSTAGE]: (
    gameId: string,
    playerId: string,
    roomName: RoomName
  ) => void;

  [ClientEvent.SNIPER_SHOT]: (gameId: string, sniperTargetId: string) => void;

  [ClientEvent.START_GAME]: (gameId: string) => void;

  [ClientEvent.SUBMIT_HOSTAGES]: (gameId: string, roomName: RoomName) => void;

  [ClientEvent.TERMINATE_SHARE]: (
    gameId: string,
    action: PlayerActionShareResultReceived
  ) => void;

  [ClientEvent.UPDATE_PLAYER]: (gameId: string, player: Player) => void;

  [ClientEvent.UPDATE_GAME_SETTINGS]: (
    gameId: string,
    newSettings: Partial<GameSettings>
  ) => void;

  [ClientEvent.WITHDRAW_ABDICATION_OFFER]: (
    gameId: string,
    offer: PlayerActionAbdicationOffered
  ) => void;

  [ClientEvent.WITHDRAW_SHARE_OFFER]: (
    gameId: string,
    action: PlayerActionShareOffered
  ) => void;
};

/**
 * Listeners for `ServerEvent`s
 */
export type ServerEventListeners = {
  [ServerEvent.ACTION_PENDING]: (
    playerId: string,
    action: PlayerAction
  ) => void;
  [ServerEvent.ACTION_RESOLVED]: (
    playerId: string,
    action: PlayerAction
  ) => void;
  [ServerEvent.GAME_CREATED]: (game: Game) => void;
  [ServerEvent.GAME_OVER]: (
    gameId: string,
    reason: GameOverReason,
    game: Game
  ) => void;
  [ServerEvent.GAME_GOTTEN]: (gameId: string, game: Game) => void;
  [ServerEvent.GAME_JOINED]: (game: Game) => void;
  [ServerEvent.GAME_NOTIFICATION]: (
    gameId: string,
    notification: GameNotification
  ) => void;
  [ServerEvent.GAME_NOT_FOUND]: () => void;
  [ServerEvent.GAME_UPDATED]: (gameId: string, game: Game) => void;
  [ServerEvent.PLAYER_GOTTEN]: (playerId: string, player: Player) => void;
  [ServerEvent.PLAYER_KICKED]: (gameId: string, playerId: string) => void;
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
