import { cloneDeep } from "lodash";
import { ServerEvent } from "../../../client/src/types/event.types";
import { Player } from "../../../client/src/types/game.types";
import { GameManager } from "../game/model";
import { ToastOptions } from 'react-toastify';

export class PlayerManager {
  constructor(
    public gameManager: GameManager,
    public socketId: string,
    public aliasSocketIds: string[] = []
  ) {}

  _broadcast(): void {
    this.gameManager.io.emit(ServerEvent.PLAYER_UPDATED, this.socketId, this._pointer());
    this.gameManager.io.emit(ServerEvent.GAME_UPDATED, this.gameManager.gameId, this.gameManager._pointer())
  }

  _pointer(): Player {
    return this.gameManager._pointer().players[this.socketId];
  }

  _mutate(mutativeCb: (player: Player) => void) {
    mutativeCb(this._pointer());
    this._broadcast();
  }

  _set(player: Player): void {
    const gamePointer = this.gameManager._pointer();

    this.gameManager._set({
      ...gamePointer,
      players: {
        ...gamePointer.players,
        [this.socketId]: player,
      },
    });

    this._broadcast();
  }

  public pushNotification(message: string, toastOptions: ToastOptions = {}): void {
    this.gameManager.io.emit(ServerEvent.PLAYER_NOTIFICATION, { [this.socketId]: true }, message, toastOptions)
  }

  public set(player: Player): void {
    this._set(player);
  }

  public snapshot(): Player {
    return cloneDeep(this._pointer());
  }

  public update(mutativeCb: (player: Player) => void) {
    this._mutate(mutativeCb);
  }
}