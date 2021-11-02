export enum NotificationType {
  GENERAL = "general",
  PLAYER_JOINED = 'player_joined'
}

export interface NotificationBase {
  type: NotificationType;
  message: string;
}

export type Notification = NotificationBase;