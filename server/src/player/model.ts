import { cloneDeep } from "lodash";
import { ServerEvent } from "../../../client/src/types/event.types";
import { Player, RoomName } from "../../../client/src/types/game.types";
import { GameManager, Operation } from "../game/model";
import { NotificationType, PlayerNotification, PlayerNotificationFn } from "../../../client/src/types/notification.types";
import { PlayerAction, PlayerActionCardShareOffered, PlayerActionColorShareOffered } from "../../../client/src/types/player-action.types";
import { RoleKey, TeamColor } from "../../../client/src/types/role.types";

export class PlayerManager {
  constructor(
    public gameManager: GameManager,
    public socketId: string,
    public aliasSocketIds: string[] = []
  ) {}

  _broadcast(): void {
    this._withPointer((pointer) => {
      this.gameManager.io.emit(
        ServerEvent.PLAYER_UPDATED,
        this.socketId,
        pointer
      );
    });
    this.gameManager._broadcast();
  }

  _mutate(mutativeCb: (player: Player) => void) {
    this._withPointer((pointer) => {
      mutativeCb(pointer);
      this._broadcast();
    });
  }

  _pointer(): Player | undefined {
    const operation = this.gameManager._withPointer((pointer) => {
      const canonicalId = [this.socketId, ...this.aliasSocketIds].find(
        (id) => pointer.players[id]
      );
      return canonicalId ? pointer.players[canonicalId] : undefined;
    });
    if (operation.status === "success") {
      return operation.result;
    }
  }

  _set(player: Player): void {
    this.gameManager.setWithPointer((gamePointer) => ({
      ...gamePointer,
      players: {
        ...gamePointer.players,
        [this.socketId]: player,
      },
    }));

    this._broadcast();
  }

  _withPointer<T = void>(cb: (playerPointer: Player) => T): Operation<T> {
    const pointer = this._pointer();
    if (pointer) {
      const result = cb(pointer);
      return { status: "success", result };
    } else {
      return { status: "error" };
    }
  }

  public pushPendingAction(playerAction: PlayerAction): void {
    this.gameManager.io.emit(
      ServerEvent.ACTION_PENDING,
      this.socketId,
      playerAction
    );
  }

  public pushNotification(
    playerNotification: PlayerNotification | PlayerNotificationFn
  ): void {
    this._withPointer((player) => {
      const notification =
        typeof playerNotification === "function"
          ? playerNotification(player)
          : playerNotification;

      this.gameManager.io.emit(
        ServerEvent.PLAYER_NOTIFICATION,
        { [this.socketId]: true },
        notification
      );
    });
  }

  public resolvePendingAction(
    playerAction: PlayerAction,
    playerNotification?: PlayerNotification
  ): void {
    this.update((player) => {
      delete player.pendingActions[playerAction.id];
    });

    this.gameManager.io.emit(
      ServerEvent.ACTION_RESOLVED,
      this.socketId,
      playerAction
    );

    if (playerNotification) {
      this.pushNotification(playerNotification);
    }
  }

  public roomName(): RoomName {
    return this.gameManager.currentRound().round.playerAllocation[
      this.socketId
    ];
  }

  public set(player: Player): void {
    this._set(player);
  }

  public shareCard(
    action: PlayerActionCardShareOffered,
    otherPlayerId: string,
    sharedByPlayer: RoleKey,
    sharedWithPlayer: RoleKey,
    roundIdx: number
  ): void {
    this.update((player) => {
      player.conditions.shareRecords.push({
        action,
        roundIdx,
        sharedByPlayer,
        sharedWithPlayer,
      });
    });

    this.resolvePendingAction(action, {
      type: NotificationType.CARD_SHARED,
      playerIdSharedWith: otherPlayerId,
      infoSeen: sharedWithPlayer,
    });
  }

  public shareColor(
    action: PlayerActionColorShareOffered,
    otherPlayerId: string,
    sharedByPlayer: TeamColor,
    sharedWithPlayer: TeamColor,
    roundIdx: number
  ): void {
    this.update((player) => {
      player.conditions.shareRecords.push({
        action,
        roundIdx,
        sharedByPlayer,
        sharedWithPlayer,
      });
    });

    this.resolvePendingAction(action, {
      type: NotificationType.COLOR_SHARED,
      playerIdSharedWith: otherPlayerId,
      infoSeen: sharedWithPlayer,
    });
  }

  public snapshot(): Player | undefined {
    const operation = this._withPointer((pointer) => cloneDeep(pointer));
    if (operation.status === "success") {
      return operation.result;
    }
  }

  public update(mutativeCb: (player: Player) => void) {
    this._mutate(mutativeCb);
  }
}