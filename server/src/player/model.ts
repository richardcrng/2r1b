import { cloneDeep } from "lodash";
import { ServerEvent } from "../../../client/src/types/event.types";
import { Player } from "../../../client/src/types/game.types";
import { GameManager, Operation } from "../game/model";
import { ToastOptions } from 'react-toastify';

export class PlayerManager {
  constructor(
    public gameManager: GameManager,
    public socketId: string,
    public aliasSocketIds: string[] = []
  ) {}

  _broadcast(): void {
    this._withPointer(pointer => {
      this.gameManager.io.emit(
        ServerEvent.PLAYER_UPDATED,
        this.socketId,
        pointer
      );
    });
    this.gameManager._broadcast();
  }

  _mutate(mutativeCb: (player: Player) => void) {
    this._withPointer(pointer => {
      mutativeCb(pointer);
      this._broadcast();
    })
  }

  _pointer(): Player | undefined {
    const operation = this.gameManager._withPointer(
      (pointer) => pointer.players[this.socketId]
    );
    if (operation.status === "success") {
      return operation.result;
    }
  }

  _set(player: Player): void {
    this.gameManager.setWithPointer(gamePointer => ({
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
      return { status: 'success', result }
    } else {
      return { status: 'error' }
    }
  }

  public pushNotification(
    message: string,
    toastOptions: ToastOptions = {}
  ): void {
    this.gameManager.io.emit(
      ServerEvent.PLAYER_NOTIFICATION,
      { [this.socketId]: true },
      message,
      toastOptions
    );
  }

  public set(player: Player): void {
    this._set(player);
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