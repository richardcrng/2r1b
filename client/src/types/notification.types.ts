import { Player } from "./game.types";

export enum NotificationType {
  CARD_SHARED = "card-shared",
  COLOR_SHARED = "color-shared",
  GENERAL = "general",
  PLAYER_JOINED = "player-joined",
}

export type PlayerNotificationFn = (player: Player) => PlayerNotification;

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

export type GameNotification = GameNotificationGeneral;
export type PlayerNotification = PlayerNotificationGeneral;

export type Notification = GameNotification | PlayerNotification;
