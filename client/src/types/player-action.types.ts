import { RoomName } from "./game.types";
import { RoleKey, TeamColor } from "./role.types";

export enum PlayerActionType {
  ABDICATION_OFFERED = 'abdication-offered',
  CARD_SHARE_OFFERED = 'card-share-offered',
  COLOR_SHARE_OFFERED = 'color-share-offered',
  PRIVATE_REVEAL_OFFERED = 'private-reveal',
  PUBLIC_REVEAL_OFFERED = 'public-reveal',
}

export interface PlayerActionBase {
  id: string;
  type: PlayerActionType;
  room: RoomName;
}

export interface PlayerActionAbdicationOffered extends PlayerActionBase {
  type: PlayerActionType.ABDICATION_OFFERED,
  abdicatingLeaderId: string;
  proposedNewLeaderId: string;
}

export function isPlayerAbdicationAction(action: PlayerAction): action is PlayerActionAbdicationOffered {
  return action.type === PlayerActionType.ABDICATION_OFFERED
}

export interface PlayerActionPublicRevealOffered extends PlayerActionBase {
  type: PlayerActionType.PUBLIC_REVEAL_OFFERED;
  revealerId: string;
}

export type PlayerActionShareType =
  | PlayerActionType.CARD_SHARE_OFFERED
  | PlayerActionType.COLOR_SHARE_OFFERED;

export interface PlayerActionShareOfferedBase extends PlayerActionBase {
  type: PlayerActionShareType;
  sharerId: string;
  offeredPlayerId: string;
}

export type PlayerActionShareOffered =
  | PlayerActionCardShareOffered
  | PlayerActionColorShareOffered;

export interface PlayerShareRecordBase {
  round: number;
  action: PlayerActionShareOffered;
  sharedByPlayer: TeamColor | RoleKey;
  sharedWithPlayer: TeamColor | RoleKey;
}

export function isPlayerCardShareRecord(
  shareRecord: PlayerShareRecord
): shareRecord is PlayerCardShareRecord {
  return isPlayerCardShareAction(shareRecord.action);
}

export function isPlayerColorShareRecord(
  shareRecord: PlayerShareRecord
): shareRecord is PlayerColorShareRecord {
  return isPlayerColorShareAction(shareRecord.action);
}

export interface PlayerCardShareRecord extends PlayerShareRecordBase {
  action: PlayerActionCardShareOffered;
  sharedByPlayer: RoleKey;
  sharedWithPlayer: RoleKey;
}

export interface PlayerColorShareRecord extends PlayerShareRecordBase {
  action: PlayerActionColorShareOffered;
  sharedByPlayer: TeamColor;
  sharedWithPlayer: TeamColor;
}

export type PlayerShareRecord = PlayerCardShareRecord | PlayerColorShareRecord;

export function isPlayerShareAction(
  action: PlayerAction
): action is PlayerActionShareOffered {
  return [
    PlayerActionType.CARD_SHARE_OFFERED,
    PlayerActionType.COLOR_SHARE_OFFERED,
  ].includes(action.type);
}

export interface PlayerActionColorShareOffered extends PlayerActionShareOfferedBase {
  type: PlayerActionType.COLOR_SHARE_OFFERED;
}

export function isPlayerCardShareAction(
  action: PlayerAction
): action is PlayerActionCardShareOffered {
  return action.type === PlayerActionType.CARD_SHARE_OFFERED;
}

export interface PlayerActionCardShareOffered extends PlayerActionShareOfferedBase {
  type: PlayerActionType.CARD_SHARE_OFFERED;
}

export function isPlayerColorShareAction(
  action: PlayerAction
): action is PlayerActionColorShareOffered {
  return action.type === PlayerActionType.COLOR_SHARE_OFFERED;
}

export type PlayerAction = PlayerActionAbdicationOffered | PlayerActionShareOffered