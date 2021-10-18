import { PlayerRole, RoleKey } from "./role.types";

export enum GameStatus {
  LOBBY = "LOBBY",
  ONGOING = "ONGOING",
  COMPLETE = "COMPLETE",
}

export enum CardType {
  GOLD = 'gold',
  FIRE = 'fire',
  EMPTY = 'empty'
}

export interface Card {
  /** If not present, then the card has not been dealt (and is stacked) */
  holdingPlayerId?: string;
  id: number;
  isFlipped?: boolean;
  isStacked?: boolean;
  type: CardType;
}

export interface Deck {
  /** Cards keyed by a unique card id */
  cards: Record<number, Card>;
  // /** Array of card ids */
  // dealt: string[];
  // /** Array of card ids */
  // stacked: number[];
}

export interface Player {
  socketId: string;
  gameId?: string;
  name?: string;
  isHost?: boolean;
  role?: PlayerRole;
  colors?: string[]
}

export interface Turn {
  keyholderId: string;
  selected: {
    playerId: string;
    cardIdx: number;
  };
  flip: CardType;
}

export enum LeaderRecordMethod {
  APPOINTMENT = "appointment",
  ABDICATION = "abdication",
  USURPATION = "usurpation"
}

export interface LeaderRecordBase {
  method: LeaderRecordMethod;
  leaderId: string;
}

export interface LeaderAbdication {
  method: LeaderRecordMethod.ABDICATION;
  abdicaterId: string;
}

export interface LeaderAppointment {
  method: LeaderRecordMethod.APPOINTMENT;
  appointerId: string;
}

export interface LeaderUsurpation extends LeaderRecordBase {
  method: LeaderRecordMethod.USURPATION;
  votes: {
    [playerId: string]: number;
  }
}

export type LeaderRecord = LeaderAbdication | LeaderAppointment | LeaderUsurpation;

export enum PlayerActionType {
  CARD_SHARE = 'card-share',
  COLOR_SHARE = 'color-share',
  PRIVATE_REVEAL = 'private-reveal',
  PUBLIC_REVEAL = 'public-reveal',
}

export interface PlayerActionBase {
  type: PlayerActionType;
  room: RoomName;
}

export interface PlayerActionPublicReveal {
  type: PlayerActionType.PUBLIC_REVEAL;
  revealerId: string;
}

export interface PlayerActionShareBase extends PlayerActionBase {
  type: PlayerActionType.CARD_SHARE | PlayerActionType.COLOR_SHARE;
  proposerId: string;
  accepterId: string;
}

export interface PlayerActionColorShare extends PlayerActionShareBase {
  type: PlayerActionType.COLOR_SHARE;
}

export interface PlayerActionCardShare extends PlayerActionShareBase {
  type: PlayerActionType.CARD_SHARE;
}

export type PlayerAction = PlayerActionColorShare | PlayerActionColorShare

export interface RoomRound {
  leadersRecord: LeaderRecord[];
  hostages: string[];
}

export enum RoomName {
  A = "a",
  B = "b"
}

export interface Round {
  number: 1 | 2 | 3 | 4 | 5;
  timerSeconds: number;
  rooms: Record<RoomName, RoomRound>;
  actions: PlayerAction[];
  playerAllocation: Record<string, RoomName>;
}

export type Game = GameBase | GameInLobby | GameOngoing | GameComplete;

export interface GameBase {
  id: string;
  players: {
    [playerSocketId: string]: Player;
  };
  rounds: Round[];
  roles: {
    inPlay: Record<RoleKey, number>;
    allocated: Partial<Record<RoleKey, number>>;
  };
  status: GameStatus;
}

export interface GameInLobby extends GameBase {
  status: GameStatus.LOBBY;
}

export interface GameOngoing extends GameBase {
  status: GameStatus.ONGOING;
}

export interface GameComplete extends GameBase {
  status: GameStatus.COMPLETE;
}