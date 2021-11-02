import { chunk, cloneDeep, last, shuffle } from "lodash";
import { selectDictionaryOfVotesForPlayers } from "../../../client/src/selectors/game";
import { ServerEvent, ServerIO } from "../../../client/src/types/event.types";
import { Game, LeaderRecord, LeaderRecordMethod, LeaderVote, Player, PlayerRoomAllocation, RoomName, Round, RoundStatus } from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import sleep from "../../../client/src/utils/sleep";
import { PlayerManager } from "../player/model";
import { SERVER_IO } from '../server';
import { ToastOptions } from 'react-toastify';

const GAMES_DB: Record<Game["id"], Game> = {};

export interface OperationBase<T = void> {
  status: 'success' | 'error';
  result?: T;
}

export interface OperationSuccess<T = void> extends OperationBase<T> {
  status: 'success';
  result: T;
}

export interface OperationError<T = void> extends OperationBase<T> {
  status: 'error';
  result?: never;
}

export type Operation<T = void> = OperationSuccess<T> | OperationError<T>;

export class GameManager {
  constructor(
    public gameId: string,
    public gamesStore: Record<string, Game> = GAMES_DB,
    public io: ServerIO = SERVER_IO
  ) {}

  _broadcast(): void {
    this._withPointer(pointer => {
      this.io.emit(ServerEvent.GAME_UPDATED, this.gameId, pointer);
    })
  }

  _mutate(mutativeCb: (game: Game) => void): void {
    this._withPointer(mutativeCb);
    this._broadcast();
  }

  _pointer(): Game | undefined {
    return this.gamesStore[this.gameId];
  }

  _set(game: Game): void {
    this.gamesStore[this.gameId] = game;
    this._broadcast();
  }

  _withPointer<T = void>(cb: (gamePointer: Game) => T): Operation<T> {
    const pointer = this._pointer();
    if (pointer) {
      const result = cb(pointer);
      return { status: 'success', result }
    } else {
      return { status: 'error' }
    }
  }

  public addLeaderRecord(roomName: RoomName, record: LeaderRecord): void {
    this.updateCurrentRound((round) => {
      const room = round.rooms[roomName];
      room.leadersRecord.push(record);
    });
  }

  public appointLeader(
    roomName: RoomName,
    leaderId: string,
    appointerId: string
  ): void {
    const { round } = this.currentRound();
    if (round) {
      const targetRoom = round.rooms[roomName];
      if (targetRoom.leadersRecord.length === 0) {
        this.addLeaderRecord(roomName, {
          method: LeaderRecordMethod.APPOINTMENT,
          leaderId,
          appointerId,
        });
      }
    }
  }

  public assignInitialRoles(): void {
    this._withPointer(pointer => {
      const rolesCount = pointer.rolesCount;
      const keysToShuffle = Object.keys(rolesCount).reduce(
        (acc, currRoleKey) => [
          ...acc,
          ...Array(rolesCount[currRoleKey as RoleKey]).fill(currRoleKey),
        ],
        [] as RoleKey[]
      );

      const playerIds = Object.keys(pointer.players);
      const shuffledRoleKeys = shuffle(keysToShuffle);

      for (let idx = 0; idx < playerIds.length; idx++) {
        const playerId = playerIds[idx];
        this.updatePlayer(playerId, (player) => {
          player.role = shuffledRoleKeys[idx];
        });
      }
    })
  }

  public assignInitialRooms(): void {
    this._withPointer(pointer => {
      const playerIds = Object.keys(pointer.players);
      const shuffledIds = shuffle(playerIds);
      const firstRoomSize = Math.ceil(playerIds.length / 2);
      const [playersInA, playersInB] = chunk(shuffledIds, firstRoomSize);

      this.update((game) => {
        const roomAllocation: PlayerRoomAllocation = {};

        for (let playerId of playersInA) {
          roomAllocation[playerId] = RoomName.A;
        }

        for (let playerId of playersInB) {
          roomAllocation[playerId] = RoomName.B;
        }

        game.rounds[0].playerAllocation = roomAllocation;
      });
    })
  }

  public create(game: Game): void {
    this.set(game);
  }

  public currentLeaderRecord(roomName: RoomName): LeaderRecord | undefined {
    const operation = this._withPointer((pointer) =>
      last(pointer.rounds[this.currentRound().idx].rooms[roomName].leadersRecord)
    );
    return operation.status === 'success' ? operation.result : undefined;
  }

  public currentRound(): { round: Round; idx: number } {
    const operation = this._withPointer(pointer => {
      for (let [idx, round] of Object.entries(pointer.rounds)) {
        if (round.status === RoundStatus.ONGOING) {
          return { round, idx: parseInt(idx) };
        }
      }
    })

    if (operation.status === 'success' && operation.result) {
      return operation.result
    } else {
      throw new Error("No round found")
    }
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.managePlayer(playerId).snapshot();
  }

  public getPlayerOrFail(playerId: string) {
    const player = this.getPlayer(playerId);
    if (player) {
      return player
    } else {
      throw new Error(`Couldn't find player with id ${playerId}`)
    }
  }

  public managePlayer(
    playerId: string,
    aliasIds: string[] = []
  ): PlayerManager {
    return new PlayerManager(this, playerId, aliasIds);
  }

  public players(): Readonly<Record<string, Player>> {
    const snapshot = this.snapshot();
    if (snapshot) {
      return snapshot.players;
    } else {
      throw new Error('Could not find game to locate players for')
    }
  }

  public playersInRoom(roomName: RoomName): Readonly<Record<string, Player>> {
    const { playerAllocation } = this.currentRound().round;
    return Object.values(this.players()).reduce(
      (acc, curr) =>
        playerAllocation[curr.socketId] === roomName
          ? { ...acc, [curr.socketId]: curr }
          : acc,
      {} as Record<string, Player>
    );
  }

  public pushNotificationToAll(
    message: string,
    toastOptions: ToastOptions = {}
  ): void {
    this.io.emit(
      ServerEvent.GAME_NOTIFICATION,
      this.gameId,
      message,
      toastOptions
    );
  }

  public pushNotificationToRoom(
    roomName: RoomName,
    message: string,
    toastOptions: ToastOptions = {}
  ): void {
    this.pushNotificationToPlayers(message, toastOptions, (player) => !!this.playersInRoom(roomName)[player.socketId]);
  }

  public pushNotificationToPlayerById(
    playerId: string,
    message: string,
    toastOptions: ToastOptions = {}
  ): void {
    this.managePlayer(playerId).pushNotification(message, toastOptions);
  }

  public pushNotificationToPlayers(
    message: string,
    toastOptions: ToastOptions = {},
    where: (player: Player) => boolean = () => true
  ): void {
    const playersToNotify = Object.values(this.players()).filter(where);
    for (let player of playersToNotify) {
      this.managePlayer(player.socketId).pushNotification(
        message,
        toastOptions
      );
    }
  }

  public set(game: Game): void {
    this._set(game);
  }

  public setWithPointer(cb: (gamePointer: Game) => Game): void {
    this._withPointer(pointer => {
      this.set(cb(pointer))
    })
  }

  public snapshot(): Game | undefined {
    const operation = this._withPointer(pointer => cloneDeep(pointer))
    if (operation.status === 'success') {
      return operation.result;
    }
  }

  public async startTimer(): Promise<void> {
    this._withPointer(async (pointer) => {
      while (pointer.currentTimerSeconds && pointer.currentTimerSeconds > 0) {
        await sleep(1000);
        this.update((gameState) => {
          if (gameState.currentTimerSeconds) {
            gameState.currentTimerSeconds -= 1;
          }
        });
      }
    })
  }

  public update(mutativeCb: (game: Game) => void) {
    this._mutate(mutativeCb);
  }

  public updateCurrentRound(mutativeCb: (round: Round) => void): void {
    this.update((game) => {
      mutativeCb(game.rounds[this.currentRound().idx]);
    });
  }

  public updatePlayer(playerId: string, mutativeCb: (player: Player) => void) {
    this.managePlayer(playerId).update(mutativeCb);
  }

  public votesAgainstEachPlayer(): Readonly<Record<string, LeaderVote[]>> {
    const snapshot = this.snapshot(); // prevent memoisation
    if (snapshot) {
      return selectDictionaryOfVotesForPlayers(snapshot);
    } else {
      throw new Error("Could not find game to locate players for")
    }
  }

  public votesAgainstPlayer(playerId: string): ReadonlyArray<LeaderVote> {
    return this.votesAgainstEachPlayer()[playerId];
  }
}