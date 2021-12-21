import { chunk, cloneDeep, last, partition, sample, shuffle } from "lodash";
import { selectDictionaryOfVotesForPlayers } from "../../../client/src/selectors/game-selectors";
import { ServerEvent, ServerIO } from "../../../client/src/types/event.types";
import {
  GameNotification,
  NotificationForPlayer,
  NotificationType,
} from "../../../client/src/types/notification.types";
import {
  createStartingRounds,
  Game,
  GameStatus,
  LeaderRecord,
  LeaderRecordMethod,
  LeaderVote,
  otherRoom,
  Player,
  PlayerRoomAllocation,
  RoomName,
  Round,
  RoundStatus,
} from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import sleep from "../../../client/src/utils/sleep";
import { PlayerManager } from "../player/model";
import { SERVER_IO } from "../server";
import {
  generateRandomGameId,
  getColors,
} from "../../../client/src/utils/data-utils";
import {
  DEFAULT_STARTING_ROLES_COUNT,
  getRoleColor,
  getRoleDefinition,
} from "../../../client/src/utils/role-utils";
import {
  PlayerAction,
  PlayerActionCardShareOffered,
  PlayerActionColorShareOffered,
  PlayerActionFn,
  PlayerActionShareOffered,
  PlayerActionType,
} from "../../../client/src/types/player-action.types";

const GAMES_DB: Record<Game["id"], Game> = {};

export interface OperationBase<T = void> {
  status: "success" | "error";
  result?: T;
}

export interface OperationSuccess<T = void> extends OperationBase<T> {
  status: "success";
  result: T;
}

export interface OperationError<T = void> extends OperationBase<T> {
  status: "error";
  result?: never;
}

export type Operation<T = void> = OperationSuccess<T> | OperationError<T>;

/** Map of all game managers - to avoid creating new ones */
const gameManagerMap = new Map<string, GameManager>();

export class GameManager {
  _playerManagerMap = new Map<string, PlayerManager>();

  constructor(
    public gameId: string,
    public gamesStore: Record<string, Game> = GAMES_DB,
    public io: ServerIO = SERVER_IO
  ) {}

  static for(gameId: string): GameManager {
    const existingManager = gameManagerMap.get(gameId);
    if (existingManager) {
      return existingManager;
    } else {
      const newManager = new this(gameId);
      gameManagerMap.set(gameId, newManager);
      return newManager;
    }
  }

  static hostNew(socketId: string, playerName?: string): GameManager {
    const gameId = generateRandomGameId();
    const game: Game = {
      id: gameId,
      endgame: {},
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
      settings: { colorSharing: false },
    };
    const gameManager = GameManager.for(gameId);
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

  public announceNewRound(): void {
    this.pushPlayersNotification({
      type: NotificationType.GENERAL,
      message: `⏳ A new round has started!`,
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

  public appointRandomLeadersIfUnfilled(): void {
    for (const roomName of Object.values(RoomName)) {
      if (!this.currentLeaderRecord(roomName)) {
        const newLeader = sample(Object.values(this.playersInRoom(roomName)));

        if (!newLeader) throw new Error("Failed to randomly pick a new leader");

        this.updateCurrentRound((round) => {
          round.rooms[roomName].leadersRecord.push({
            method: LeaderRecordMethod.RANDOMISATION,
            leaderId: newLeader.socketId,
          });
        });

        this.pushPlayerNotificationToRoom(roomName, (player) => ({
          type: NotificationType.GENERAL,
          message: `Since no leader existed, ${
            newLeader.socketId === player.socketId
              ? "you were"
              : `${newLeader.name} was`
          } picked at random to be leader`,
        }));
      }
    }
  }

  public assignInitialRoles(): void {
    this._withPointer((pointer) => {
      const [buryableRoles, nonBuryableRoles] = partition(
        Object.entries(pointer.rolesCount) as [RoleKey, number][],
        ([roleKey]) => getRoleDefinition(roleKey).restrictions.isBuryable
      );

      const buryableKeys = buryableRoles.reduce(
        (acc, [key, count]) => [...acc, ...Array(count).fill(key)],
        [] as RoleKey[]
      );

      const nonBuryableKeys = nonBuryableRoles.reduce(
        (acc, [key, count]) => [...acc, ...Array(count).fill(key)],
        [] as RoleKey[]
      );

      const playerIds = shuffle(Object.keys(pointer.players));

      const [maybeBuriedKey, ...shuffledBuryableKeys] = shuffle(buryableKeys);
      // ensures the final shuffled key can be buried if needed
      const shuffledRoleKeys = [
        ...shuffle([...shuffledBuryableKeys, ...nonBuryableKeys]),
        maybeBuriedKey,
      ];

      for (let idx = 0; idx < shuffledRoleKeys.length; idx++) {
        const playerId = playerIds[idx];
        if (playerId) {
          this.updatePlayer(playerId, (player) => {
            player.role = shuffledRoleKeys[idx];
          });
        } else {
          this.update((game) => {
            game.buriedRole = shuffledRoleKeys[idx];
          });
        }
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

        for (const playerId of playersInA) {
          roomAllocation[playerId] = RoomName.A;
        }

        for (const playerId of playersInB) {
          roomAllocation[playerId] = RoomName.B;
        }

        game.rounds[1].playerAllocation = roomAllocation;
      });
    });
  }

  public cancelAllUnresolvedActions(): void {
    this.manageEachPlayer((playerManager) => {
      const pendingActions = Object.values(
        playerManager._pointer()?.pendingActions ?? {}
      );
      for (const action of pendingActions) {
        playerManager.resolvePendingAction(action);
      }
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
      for (const round of Object.values(pointer.rounds)) {
        if (
          [RoundStatus.ONGOING, RoundStatus.HOSTAGE_SELECTION].includes(
            round.status
          )
        ) {
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

  public exchangeHostages(): void {
    const finishingRound = this.currentRound();

    const nextRoundAllocation = { ...finishingRound.playerAllocation };

    const hostageRecord: Record<string, true> = {};

    for (const roundRoom of Object.values(finishingRound.rooms)) {
      for (const hostageId of roundRoom.hostages) {
        nextRoundAllocation[hostageId] = otherRoom(
          nextRoundAllocation[hostageId]
        );
        hostageRecord[hostageId] = true;
      }
    }

    this.pushPlayersNotification((player) => {
      if (hostageRecord[player.socketId]) {
        return {
          type: NotificationType.GENERAL,
          message:
            "🚪 Please swap rooms - you have been exchanged as a hostage",
        };
      } else {
        return {
          type: NotificationType.GENERAL,
          message: "Hostages have been told to swap rooms",
        };
      }
    });

    this.update((game) => {
      game.rounds[finishingRound.number].status = RoundStatus.COMPLETE;
      const nextRound = game.rounds[finishingRound.number + 1];
      if (nextRound) {
        nextRound.status = RoundStatus.ONGOING;
        nextRound.playerAllocation = nextRoundAllocation;
        this.startRoundTimer();
      } else {
        game.status = GameStatus.ENDGAME;
        game.endgame.finalRooms = nextRoundAllocation;
      }
    });
  }

  public getCurrentRoomFor(playerId: string): RoomName {
    return this.managePlayer(playerId).roomName();
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.managePlayer(playerId).snapshot();
  }

  public getPlayersByRole(roleKey: RoleKey): Player[] {
    return Object.values(this.players()).filter(
      (player) => player.role === roleKey
    );
  }

  public getPlayerOrFail(playerId: string) {
    const player = this.getPlayer(playerId);
    if (player) {
      return player;
    } else {
      throw new Error(`Couldn't find player with id ${playerId}`);
    }
  }

  public manageEachPlayer(cb: (playerManager: PlayerManager) => void) {
    for (const playerId in this.players()) {
      const playerManager = this.managePlayer(playerId);
      cb(playerManager);
    }
  }

  public managePlayer(
    playerId: string,
    aliasIds: string[] = []
  ): PlayerManager {
    const extantPlayerManager = this._playerManagerMap.get(playerId);
    if (extantPlayerManager) {
      return extantPlayerManager;
    } else {
      const newPlayerManager = new PlayerManager(this, playerId, aliasIds);
      this._playerManagerMap.set(playerId, newPlayerManager);
      return newPlayerManager;
    }
  }

  public moveRoundToHostageSelection(): void {
    this.cancelAllUnresolvedActions();
    this.resetAllVotes();

    this.pushGameNotificationToAll({
      type: NotificationType.GENERAL,
      message: "Round time is up - hostages must be selected",
    });

    this.appointRandomLeadersIfUnfilled();

    this.updateCurrentRound((round) => {
      round.status = RoundStatus.HOSTAGE_SELECTION;
    });
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
    notification: NotificationForPlayer,
    where: (player: Player) => boolean = () => true
  ): void {
    this.pushPlayersNotification(
      notification,
      (player) =>
        !!this.playersInRoom(roomName)[player.socketId] && where(player)
    );
  }

  public pushPlayerNotificationById(
    playerId: string,
    notification: NotificationForPlayer
  ): void {
    this.managePlayer(playerId).pushNotification(notification);
  }

  public pushPlayerPendingActionById(
    playerId: string,
    action: PlayerAction | PlayerActionFn
  ): void {
    this.managePlayer(playerId).pushPendingAction(action);
  }

  public pushPlayersNotification(
    notification: NotificationForPlayer,
    where: (player: Player) => boolean = () => true
  ): void {
    const playersToNotify = Object.values(this.players()).filter(where);
    for (const player of playersToNotify) {
      this.managePlayer(player.socketId).pushNotification(notification);
    }
  }

  public pushPlayersPendingAction(
    action: PlayerAction | PlayerActionFn,
    where: (player: Player) => boolean = () => true
  ): void {
    const playersToNotify = Object.values(this.players()).filter(where);
    for (const player of playersToNotify) {
      this.managePlayer(player.socketId).pushPendingAction(action);
    }
  }

  public resetGame(): void {
    this.update((game) => {
      game.status = GameStatus.LOBBY;
      game.endgame = {};
      delete game.buriedRole;
      game.rounds = createStartingRounds();
    });

    this.updateEachPlayer((player) => {
      delete player.role;
      player.conditions = { shareRecords: [] };
      delete player.leaderVote;
      player.pendingActions = {};
    });
  }

  public resetAllVotes(): void {
    this.manageEachPlayer((playerManager) => {
      playerManager.update((player) => {
        delete player.leaderVote;
      });
    });
  }

  public resolveAcceptedCardShare(
    cardShareAction: PlayerActionCardShareOffered,
    sharerCard: RoleKey,
    shareeCard: RoleKey
  ): void {
    const { number: roundNumber } = this.currentRound();
    const resultId = `${Date.now()}-${
      PlayerActionType.SHARE_RESULT_RECEIVED
    }-${Math.random().toString(5).slice(2)}`;

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

  public resolveAcceptedColorShare(
    colorShareAction: PlayerActionColorShareOffered,
    sharerCard: RoleKey,
    shareeCard: RoleKey
  ): void {
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

  public resolveAcceptedShare(shareAction: PlayerActionShareOffered): void {
    const offerId = shareAction.id;
    const sharerManager = this.managePlayer(shareAction.sharerId);
    const accepterManager = this.managePlayer(shareAction.offeredPlayerId);

    sharerManager.cancelAllPendingShares({ except: [offerId] });
    accepterManager.cancelAllPendingShares({ except: [offerId] });

    const sharerRole = sharerManager.getRoleOrFail();
    const accepterRole = accepterManager.getRoleOrFail();

    if (shareAction.type === PlayerActionType.CARD_SHARE_OFFERED) {
      this.resolveAcceptedCardShare(
        shareAction,
        sharerRole.key,
        accepterRole.key
      );
    } else if (shareAction.type === PlayerActionType.COLOR_SHARE_OFFERED) {
      this.resolveAcceptedColorShare(
        shareAction,
        sharerRole.key,
        accepterRole.key
      );
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

  public async startRoundTimer(): Promise<void> {
    this.announceNewRound();
    this._withPointer(async (pointer) => {
      pointer.currentTimerSeconds = this.currentRound().timerSeconds;
      while (pointer.currentTimerSeconds && pointer.currentTimerSeconds > 0) {
        await sleep(1000);
        this.update((gameState) => {
          if (gameState.currentTimerSeconds) {
            gameState.currentTimerSeconds -= 1;
          }
        });
      }
      this.moveRoundToHostageSelection();
    });
  }

  /**
   * Updates a game, by applying a callback function,
   *  and broadcasts the update to sockets
   * @param mutativeCb - mutative callback function for the game data
   */
  public update(mutativeCb: (game: Game) => void) {
    this._mutate(mutativeCb);
  }

  public updateCurrentRound(mutativeCb: (round: Round) => void): void {
    this.update((game) => {
      mutativeCb(game.rounds[this.currentRound().number]);
    });
  }

  public updateEachPlayer(mutativeCb: (player: Player) => void): void {
    for (const playerId in this.players()) {
      this.managePlayer(playerId).update(mutativeCb);
    }
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
