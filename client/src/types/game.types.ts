import { PlayerAction, PlayerShareRecord } from "./player-action.types";
import { RoleKey } from "./role.types";

export enum GameStatus {
  LOBBY = "LOBBY",
  ONGOING = "ONGOING",
  COMPLETE = "COMPLETE",
}
export enum RoundStatus {
  ONGOING = 'ongoing',
  HOSTAGE_SELECTION = 'hostage-selection',
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

export interface LeaderVote {
  voterId: string;
  proposedLeaderId: string;
  roomName: RoomName;
  timestamp: number;
}

export interface PlayerConditions {
  shareRecords: PlayerShareRecord[];
  isDead?: boolean;
}

export interface Player {
  socketId: string;
  gameId?: string;
  name?: string;
  isHost?: boolean;
  role?: RoleKey;
  colors?: string[];
  leaderVote?: LeaderVote;
  conditions: PlayerConditions;
  pendingActions: Record<string, PlayerAction>;
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
  number: number;
  status: RoundStatus;
  timerSeconds: number;
  rooms: Record<RoomName, RoomRound>;
  playerAllocation: PlayerRoomAllocation;
}

export const createRound = (timerSeconds: number, number: number): Round => ({
  // actions: [],
  number,
  status: RoundStatus.PENDING,
  timerSeconds,
  rooms: {
    [RoomName.A]: { leadersRecord: [], hostages: [] },
    [RoomName.B]: { leadersRecord: [], hostages: [] },
  },
  playerAllocation: {}
});

export const createStartingRounds = (): Record<number, Round> => ({
  1: createRound(180, 1),
  2: createRound(120, 2),
  3: createRound(60, 3)
});

export type PlayerRoomAllocation = Record<string, RoomName>;


export type RolesCount = Record<RoleKey, number>

export interface Game {
  id: string;
  actions: PlayerAction[];
  players: {
    [playerSocketId: string]: Player;
  };
  currentTimerSeconds?: number;
  rounds: Record<number, Round>;
  rolesCount: RolesCount;
  buriedRole?: RoleKey;
  status: GameStatus;
}
