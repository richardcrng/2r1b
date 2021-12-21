import { cloneDeep } from "lodash";
import { ServerEvent } from "../../../client/src/types/event.types";
import { Player, RoomName } from "../../../client/src/types/game.types";
import { GameManager, Operation } from "../game/model";
import {
  NotificationForPlayer,
  NotificationType,
} from "../../../client/src/types/notification.types";
import {
  isPlayerShareAction,
  PlayerAction,
  PlayerActionCardShareOffered,
  PlayerActionColorShareOffered,
  PlayerActionFn,
  PlayerActionType,
  PlayerShareRecord,
} from "../../../client/src/types/player-action.types";
import {
  FullyDefined,
  PlayerRole,
  RoleKey,
  TeamColor,
} from "../../../client/src/types/role.types";
import { getRoleDefinition } from "../../../client/src/utils/role-utils";

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

  public cancelAllPendingShares({
    except = [],
  }: {
    except?: string[];
  } = {}): void {
    this._withPointer((player) => {
      const pendingShares = Object.values(player.pendingActions)
        .filter(isPlayerShareAction)
        .filter(({ id }) => !except.includes(id));

      pendingShares.forEach((shareOffer) => {
        this.resolvePendingAction(shareOffer);

        const otherPlayerId = [
          shareOffer.offeredPlayerId,
          shareOffer.sharerId,
        ].find((id) => id !== player.socketId);

        if (otherPlayerId) {
          const shareType =
            shareOffer.type === PlayerActionType.CARD_SHARE_OFFERED
              ? "card"
              : "color";

          const messageToOtherPlayer =
            otherPlayerId === shareOffer.sharerId
              ? `${this.getNameOrFail()} has declined your ${shareType} share offer to share with someone else`
              : `${this.getNameOrFail()} has withdrawn their ${shareType} share offer to share with someone else`;

          this.gameManager
            .managePlayer(otherPlayerId)
            .resolvePendingAction(shareOffer, {
              type: NotificationType.GENERAL,
              message: messageToOtherPlayer,
            });
        }
      });
    });
  }

  public getRoleOrFail(): FullyDefined<PlayerRole> {
    const roleKey = this._pointer()?.role;
    if (!roleKey) throw new Error("Couldn't find role key for players");
    return getRoleDefinition(roleKey);
  }

  public getNameOrFail(): string {
    const name = this._pointer()?.name;
    if (!name) throw new Error("Couldn't find a name");
    return name;
  }

  public pushNotification(playerNotification: NotificationForPlayer): void {
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
        ? playerAction(this.snapshot() as Player)
        : playerAction;

    this.gameManager.io.emit(ServerEvent.ACTION_PENDING, this.socketId, action);
  }

  public resolvePendingAction(
    playerAction: PlayerAction,
    playerNotification?: NotificationForPlayer
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
    ].find((id) => this.socketId !== id);

    if (!playerIdSharedWith)
      throw new Error("Couldn't find player id shared with");

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
    ].find((id) => this.socketId !== id);

    if (!playerIdSharedWith)
      throw new Error("Couldn't find a player shared with");

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
