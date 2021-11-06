import { PlayerAction, PlayerShareRecord } from "./player-action.types";
import { RoleKey, TeamColor } from "./role.types";

export enum GameStatus {
  LOBBY = "LOBBY",
  ONGOING = "ONGOING",
  ENDGAME = 'ENDGAME',
  RESULTS = 'RESULTS',
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
  RANDOMISATION = 'randomisation',
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

export interface LeaderRandomisation extends LeaderRecordBase {
  method: LeaderRecordMethod.RANDOMISATION,
  leaderId: string;
}

export interface LeaderUsurpation extends LeaderRecordBase {
  method: LeaderRecordMethod.USURPATION;
  votes: {
    [playerId: string]: number;
  }
}

export type LeaderRecord = LeaderAbdication | LeaderAppointment | LeaderRandomisation | LeaderUsurpation;

export interface RoomRound {
  name: RoomName;
  hostages: string[];
  isReadyToExchange: boolean;
  leadersRecord: LeaderRecord[];
}

export enum RoomName {
  A = "1",
  B = "2"
}

export const otherRoom = (roomName: RoomName): RoomName => roomName === RoomName.A ? RoomName.B : RoomName.A

export interface Round {
  // actions: PlayerAction[];
  number: number;
  status: RoundStatus;
  hostageCount: number;
  timerSeconds: number;
  rooms: Record<RoomName, RoomRound>;
  playerAllocation: PlayerRoomAllocation;
}

export const createRound = (timerSeconds: number, number: number, hostageCount = 1): Round => ({
  // actions: [],
  number,
  status: RoundStatus.PENDING,
  hostageCount,
  timerSeconds,
  rooms: {
    [RoomName.A]: { name: RoomName.A, leadersRecord: [], hostages: [], isReadyToExchange: false },
    [RoomName.B]: { name: RoomName.B, leadersRecord: [], hostages: [], isReadyToExchange: false },
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

export type WinningColor = TeamColor.BLUE | TeamColor.RED | "neither"
export type GamblerPrediction = WinningColor;


export interface GameEndgame {
  gamblerPrediction?: GamblerPrediction;
  privateEyePrediction?: RoleKey;
}

export interface TeamResult {
  winningColor: WinningColor;
  reason: string;
}

export interface PlayerResult {
  role: RoleKey;
  isWin: boolean;
  reason: string;
}

export interface Game {
  id: string;
  players: {
    [playerSocketId: string]: Player;
  };
  currentTimerSeconds?: number;
  endgame: GameEndgame;
  rounds: Record<number, Round>;
  rolesCount: RolesCount;
  buriedRole?: RoleKey;
  status: GameStatus;
}
