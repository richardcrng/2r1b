import { cloneDeep } from "lodash";
import { ServerEvent } from "../../../client/src/types/event.types";
import { Player, RoomName } from "../../../client/src/types/game.types";
import { GameManager, Operation } from "../game/model";
import { PlayerNotification, PlayerNotificationFn } from "../../../client/src/types/notification.types";
import { PlayerAction, PlayerActionCardShareOffered, PlayerActionColorShareOffered, PlayerActionFn, PlayerActionType, PlayerShareRecord } from "../../../client/src/types/player-action.types";
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

  public pushPendingAction(playerAction: PlayerAction | PlayerActionFn): void {
    const action =
      typeof playerAction === "function"
        ? playerAction(this.snapshot()!)
        : playerAction;

    this.gameManager.io.emit(ServerEvent.ACTION_PENDING, this.socketId, action);
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
    return this.gameManager.currentRound().playerAllocation[this.socketId];
  }

  public set(player: Player): void {
    this._set(player);
  }

  public shareCard(
    newActionId: string,
    offerActionToResolve: PlayerActionCardShareOffered,
    sharedByPlayer: RoleKey,
    sharedWithPlayer: RoleKey,
    roundNumber: number
  ): void {
    const playerIdSharedWith = [
      offerActionToResolve.sharerId,
      offerActionToResolve.offeredPlayerId,
    ].find((id) => this.socketId !== id)!;

    const record: PlayerShareRecord = {
      offerAction: offerActionToResolve,
      playerIdSharedWith,
      roundNumber,
      sharedByPlayer,
      sharedWithPlayer,
    };

    this.update((player) => player.conditions.shareRecords.push(record));

    this.resolvePendingAction(offerActionToResolve);

    this.pushPendingAction({
      id: newActionId,
      room: this.roomName(),
      type: PlayerActionType.SHARE_RESULT_RECEIVED,
      record,
    });
  }

  public shareColor(
    newActionId: string,
    offerActionToResolve: PlayerActionColorShareOffered,
    sharedByPlayer: TeamColor,
    sharedWithPlayer: TeamColor,
    roundNumber: number
  ): void {
    const playerIdSharedWith = [
      offerActionToResolve.sharerId,
      offerActionToResolve.offeredPlayerId,
    ].find((id) => this.socketId !== id)!;

    const record: PlayerShareRecord = {
      offerAction: offerActionToResolve,
      playerIdSharedWith,
      roundNumber,
      sharedByPlayer,
      sharedWithPlayer,
    };

    this.update((player) => player.conditions.shareRecords.push(record));

    this.resolvePendingAction(offerActionToResolve);

    this.pushPendingAction({
      id: newActionId,
      room: this.roomName(),
      type: PlayerActionType.SHARE_RESULT_RECEIVED,
      record,
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