import { RoomName } from "./game.types";

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

export interface PlayerActionShareOfferedBase extends PlayerActionBase {
  type: PlayerActionType.CARD_SHARE_OFFERED | PlayerActionType.COLOR_SHARE_OFFERED;
  proposerId: string;
  accepterId: string;
}

export interface PlayerActionColorShareOffered extends PlayerActionShareOfferedBase {
  type: PlayerActionType.COLOR_SHARE_OFFERED;
}

export interface PlayerActionCardShareOffered extends PlayerActionShareOfferedBase {
  type: PlayerActionType.CARD_SHARE_OFFERED;
}

export type PlayerAction = PlayerActionAbdicationOffered | PlayerActionCardShareOffered | PlayerActionColorShareOffered