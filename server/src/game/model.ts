import { chunk, cloneDeep, last, sample, shuffle } from "lodash";
import { selectDictionaryOfVotesForPlayers } from "../../../client/src/selectors/game";
import { ServerEvent, ServerIO } from "../../../client/src/types/event.types";
import { GameNotification, NotificationType, PlayerNotification, PlayerNotificationFn } from "../../../client/src/types/notification.types";
import { createStartingRounds, Game, GameStatus, LeaderRecord, LeaderRecordMethod, LeaderVote, Player, PlayerRoomAllocation, RoomName, Round, RoundStatus } from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import sleep from "../../../client/src/utils/sleep";
import { PlayerManager } from "../player/model";
import { SERVER_IO } from '../server';
import { generateRandomGameId, getColors } from "../utils";
import { DEFAULT_STARTING_ROLES_COUNT, getRoleColor } from "../../../client/src/utils/role-utils";
import { PlayerActionCardShareOffered, PlayerActionColorShareOffered, PlayerActionShareOffered, PlayerActionType } from "../../../client/src/types/player-action.types";

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

  static hostNew(socketId: string, playerName?: string): GameManager {
    const gameId = generateRandomGameId();
    const game: Game = {
      id: gameId,
      actions: [],
      players: {
        [socketId]: {
          name: playerName,
          socketId,
          isHost: true,
          gameId,
          colors: getColors(5),
          conditions: {
            shareRecords: [],
          },
          pendingActions: {},
        },
      },
      rolesCount: { ...DEFAULT_STARTING_ROLES_COUNT },
      status: GameStatus.LOBBY,
      rounds: createStartingRounds(),
    };
    const gameManager = new GameManager(gameId);
    gameManager.set(game);
    return gameManager;
  }

  _broadcast(): void {
    this._withPointer((pointer) => {
      this.io.emit(ServerEvent.GAME_UPDATED, this.gameId, pointer);
    });
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
      return { status: "success", result };
    } else {
      return { status: "error" };
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
    const round = this.currentRound();
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
    this._withPointer((pointer) => {
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
    });
  }

  public assignInitialRooms(): void {
    this._withPointer((pointer) => {
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

        game.rounds[1].playerAllocation = roomAllocation;
      });
    });
  }

  public currentLeaderRecord(roomName: RoomName): LeaderRecord | undefined {
    const operation = this._withPointer((pointer) =>
      last(
        pointer.rounds[this.currentRound().number].rooms[roomName].leadersRecord
      )
    );
    return operation.status === "success" ? operation.result : undefined;
  }

  public currentRound(): Round {
    const operation = this._withPointer((pointer) => {
      for (let round of Object.values(pointer.rounds)) {
        if (round.status === RoundStatus.ONGOING) {
          return round;
        }
      }
    });

    if (operation.status === "success" && operation.result) {
      return operation.result;
    } else {
      throw new Error("No round found");
    }
  }

  public getCurrentRoomFor(playerId: string): RoomName {
    return this.managePlayer(playerId).roomName();
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.managePlayer(playerId).snapshot();
  }

  public getPlayerOrFail(playerId: string) {
    const player = this.getPlayer(playerId);
    if (player) {
      return player;
    } else {
      throw new Error(`Couldn't find player with id ${playerId}`);
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
      throw new Error("Could not find game to locate players for");
    }
  }

  public playersInRoom(roomName: RoomName): Readonly<Record<string, Player>> {
    const { playerAllocation } = this.currentRound();
    return Object.values(this.players()).reduce(
      (acc, curr) =>
        playerAllocation[curr.socketId] === roomName
          ? { ...acc, [curr.socketId]: curr }
          : acc,
      {} as Record<string, Player>
    );
  }

  public pushGameNotificationToAll(notification: GameNotification): void {
    this.io.emit(ServerEvent.GAME_NOTIFICATION, this.gameId, notification);
  }

  public pushPlayerNotificationToRoom(
    roomName: RoomName,
    notification: PlayerNotification | PlayerNotificationFn,
    where: (player: Player) => boolean = (player) => true
  ): void {
    this.pushPlayersNotification(
      notification,
      (player) =>
        !!this.playersInRoom(roomName)[player.socketId] && where(player)
    );
  }

  public pushPlayerNotificationById(
    playerId: string,
    notification: PlayerNotification | PlayerNotificationFn
  ): void {
    this.managePlayer(playerId).pushNotification(notification);
  }

  public pushPlayersNotification(
    notification: PlayerNotification | PlayerNotificationFn,
    where: (player: Player) => boolean = () => true
  ): void {
    const playersToNotify = Object.values(this.players()).filter(where);
    for (let player of playersToNotify) {
      this.managePlayer(player.socketId).pushNotification(notification);
    }
  }

  public resolveCardShare(cardShareAction: PlayerActionCardShareOffered, sharerCard: RoleKey, shareeCard: RoleKey): void {
    const { number: roundNumber } = this.currentRound();
    const resultId = `${Date.now()}-${PlayerActionType.SHARE_RESULT_RECEIVED}-${Math.random().toString(5).slice(2)}`;

    this.managePlayer(cardShareAction.sharerId).shareCard(
      resultId,
      cardShareAction,
      sharerCard,
      shareeCard,
      roundNumber
    );

    this.managePlayer(cardShareAction.offeredPlayerId).shareCard(
      resultId,
      cardShareAction,
      shareeCard,
      sharerCard,
      roundNumber
    );
  }

  public resolveColorShare(colorShareAction: PlayerActionColorShareOffered, sharerCard: RoleKey, shareeCard: RoleKey): void {
    const sharerColor = getRoleColor(sharerCard);
    const shareeColor = getRoleColor(shareeCard);

    const { number: roundNumber } = this.currentRound();
    const resultId = `${Date.now()}-${
      PlayerActionType.SHARE_RESULT_RECEIVED
    }-${Math.random().toString(5).slice(2)}`;
    
    this.managePlayer(colorShareAction.sharerId).shareColor(
      resultId,
      colorShareAction,
      sharerColor,
      shareeColor,
      roundNumber
    );

    this.managePlayer(colorShareAction.offeredPlayerId).shareColor(
      resultId,
      colorShareAction,
      shareeColor,
      sharerColor,
      roundNumber
    );
  }

  public resolveShare(shareAction: PlayerActionShareOffered): void {
    const sharerCard = this.getPlayerOrFail(shareAction.sharerId).role!;
    const shareeCard = this.getPlayerOrFail(shareAction.offeredPlayerId)
      .role!;
    if (shareAction.type === PlayerActionType.CARD_SHARE_OFFERED) {
      this.resolveCardShare(shareAction, sharerCard, shareeCard);
    } else if (shareAction.type === PlayerActionType.COLOR_SHARE_OFFERED) {
      this.resolveColorShare(shareAction, sharerCard, shareeCard);
    }
  }

  public set(game: Game): void {
    this._set(game);
  }

  public setWithPointer(cb: (gamePointer: Game) => Game): void {
    this._withPointer((pointer) => {
      this.set(cb(pointer));
    });
  }

  public snapshot(): Game | undefined {
    const operation = this._withPointer((pointer) => cloneDeep(pointer));
    if (operation.status === "success") {
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

      this.pushGameNotificationToAll({
        type: NotificationType.GENERAL,
        message: 'Round time is up - hostages must be selected'
      })

      for (let roomName of Object.values(RoomName)) {
        if (!this.currentLeaderRecord(roomName)) {
          const newLeader = sample(Object.values(this.playersInRoom(roomName)))!;
          this.updateCurrentRound(round => {
            round.rooms[roomName].leadersRecord.push({
              method: LeaderRecordMethod.RANDOMISATION,
              leaderId: newLeader.socketId
            })
          })
          this.pushPlayerNotificationToRoom(roomName, {
            type: NotificationType.GENERAL,
            message: `Since no leader existed, ${newLeader.name} was picked at random to be leader`
          })
        }
      }

      this.updateCurrentRound(round => {
        round.status = RoundStatus.HOSTAGE_SELECTION;
      })
    });
  }

  public update(mutativeCb: (game: Game) => void) {
    this._mutate(mutativeCb);
  }

  public updateCurrentRound(mutativeCb: (round: Round) => void): void {
    this.update((game) => {
      mutativeCb(game.rounds[this.currentRound().number]);
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
      throw new Error("Could not find game to locate players for");
    }
  }

  public votesAgainstPlayer(playerId: string): ReadonlyArray<LeaderVote> {
    return this.votesAgainstEachPlayer()[playerId];
  }
}