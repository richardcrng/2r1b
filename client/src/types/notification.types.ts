import { Player } from "./game.types";
import { RoleKey } from "./role.types";

export enum NotificationType {
  CARD_SHARED = 'card-shared',
  COLOR_SHARED = 'color-shared',
  GENERAL = "general",
  PLAYER_JOINED = 'player-joined',
}

export type PlayerNotificationFn = (player: Player) => PlayerNotification

export interface NotificationBase {
  type: NotificationType;
}

export interface GameNotificationGeneral extends NotificationBase {
  type: NotificationType.GENERAL;
  message: string;
}

export interface PlayerNotificationGeneral extends NotificationBase {
  type: NotificationType.GENERAL;
  message: string;
}

export interface PlayerNotificationCardShared extends NotificationBase {
  type: NotificationType.CARD_SHARED;
  sharingPlayerId: string;
  cardShared: RoleKey;
}

export interface PlayerNotificationColorShared extends NotificationBase {
  type: NotificationType.COLOR_SHARED;
  sharingPlayerId: string;
  cardShared: RoleKey;
}

export type GameNotification = GameNotificationGeneral;
export type PlayerNotification = PlayerNotificationGeneral | PlayerNotificationCardShared | PlayerNotificationColorShared;

export type Notification = GameNotification | PlayerNotification;