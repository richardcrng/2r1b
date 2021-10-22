import { RoleKey } from "./role.types";

export enum GameStatus {
  LOBBY = "LOBBY",
  ONGOING = "ONGOING",
  COMPLETE = "COMPLETE",
}
export enum RoundStatus {

  ONGOING = 'ongoing',
  COMPLETE = 'complete',
  PENDING = 'pending'
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
  role?: RoleKey;
  colors?: string[]
}

export interface PlayerWithRoom extends Player {
  room?: RoomName;
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

export interface LeaderAbdication extends LeaderRecordBase {
  method: LeaderRecordMethod.ABDICATION;
  abdicaterId: string;
}

export interface LeaderAppointment extends LeaderRecordBase {
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

export type PlayerAction = PlayerActionCardShare | PlayerActionColorShare

export interface RoomRound {
  leadersRecord: LeaderRecord[];
  hostages: string[];
}

export enum RoomName {
  A = "1",
  B = "2"
}

export interface Round {
  // actions: PlayerAction[];
  status: RoundStatus;
  timerSeconds: number;
  rooms: Record<RoomName, RoomRound>;
  playerAllocation: PlayerRoomAllocation;
}

export const createRound = (timerSeconds: number): Round => ({
  // actions: [],
  status: RoundStatus.PENDING,
  timerSeconds,
  rooms: {
    [RoomName.A]: { leadersRecord: [], hostages: [] },
    [RoomName.B]: { leadersRecord: [], hostages: [] },
  },
  playerAllocation: {}
});

export const createStartingRounds = () => [
  createRound(180),
  createRound(120),
  createRound(60),
];

export type PlayerRoomAllocation = Record<string, RoomName>;


export type RolesCount = Record<RoleKey, number>

export interface Game {
  id: string;
  actions: PlayerAction[];
  players: {
    [playerSocketId: string]: Player;
  };
  currentTimerSeconds?: number;
  rounds: Round[];
  rolesCount: RolesCount;
  buriedRole?: RoleKey;
  status: GameStatus;
}
