import { Player } from "./game.types";

export enum NotificationType {
  GENERAL = "general",
  PLAYER_JOINED = 'player_joined'
}

export type PlayerNotificationFn = (player: Player) => PlayerNotification

export interface NotificationBase {
  type: NotificationType.GENERAL;
}

export interface GameNotificationGeneral extends NotificationBase {
  type: NotificationType.GENERAL;
  message: string;
}

export interface PlayerNotificationGeneral extends NotificationBase {
  type: NotificationType.GENERAL;
  message: string;
}

export type GameNotification = GameNotificationGeneral;
export type PlayerNotification = PlayerNotificationGeneral;

export type Notification = GameNotification | PlayerNotification;