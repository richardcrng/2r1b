import { chunk, cloneDeep, shuffle } from "lodash";
import { ServerEvent, ServerIO } from "../../../client/src/types/event.types";
import { Game, LeaderRecord, LeaderRecordMethod, Player, PlayerRoomAllocation, RoomName, Round, RoundStatus } from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import sleep from "../../../client/src/utils/sleep";
import { PlayerManager } from "../player/model";
import { SERVER_IO } from '../server';

const GAMES_DB: Record<Game["id"], Game> = {};

export class GameManager {
  constructor(
    public gameId: string,
    public gamesStore: Record<string, Game> = GAMES_DB,
    public io: ServerIO = SERVER_IO
  ) {}

  _broadcast(): void {
    this.io.emit(ServerEvent.GAME_UPDATED, this.gameId, this._pointer());
  }

  _mutate(mutativeCb: (game: Game) => void): void {
    mutativeCb(this._pointer());
    this._broadcast();
  }

  _pointer(): Game {
    return this.gamesStore[this.gameId];
  }

  _set(game: Game): void {
    this.gamesStore[this.gameId] = game;
    this._broadcast();
  }

  public addLeaderRecord(roomName: RoomName, record: LeaderRecord): void {
    this.updateCurrentRound((round) => {
      const room = round.rooms[roomName];
      room.leadersRecord.push(record)
    });
  }

  public appointLeader(roomName: RoomName, leaderId: string, appointerId: string): void {
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
    const rolesCount = this._pointer().rolesCount;
    const keysToShuffle = Object.keys(rolesCount).reduce(
      (acc, currRoleKey) => [
        ...acc,
        ...Array(rolesCount[currRoleKey as RoleKey]).fill(currRoleKey),
      ],
      [] as RoleKey[]
    );

    const playerIds = Object.keys(this._pointer().players);
    const shuffledRoleKeys = shuffle(keysToShuffle);

    for (let idx = 0; idx < playerIds.length; idx++) {
      const playerId = playerIds[idx];
      this.updatePlayer(playerId, (player) => {
        player.role = shuffledRoleKeys[idx];
      });
    };
  }

  public assignInitialRooms(): void {
    const playerIds = Object.keys(this._pointer().players);
    const shuffledIds = shuffle(playerIds);
    const firstRoomSize = Math.ceil(playerIds.length / 2);
    const [playersInA, playersInB] = chunk(shuffledIds, firstRoomSize);

    this.update(game => {
      const roomAllocation: PlayerRoomAllocation = {};

      for (let playerId of playersInA) {
        roomAllocation[playerId] = RoomName.A;
      }

      for (let playerId of playersInB) {
        roomAllocation[playerId] = RoomName.B;
      }

      game.rounds[0].playerAllocation = roomAllocation;
    });
  }

  public create(game: Game): void {
    this.set(game);
    this.io.emit(ServerEvent.GAME_CREATED, this._pointer());
  }

  public currentRound(): { round: Round, idx: number } {
    for (let [idx, round] of Object.entries(this._pointer().rounds)) {
      if (round.status === RoundStatus.ONGOING) {
        return { round, idx: parseInt(idx) }
      }
    }
    throw new Error("Couldn't find a round")
  }

  public managePlayer(
    playerId: string,
    aliasIds: string[] = []
  ): PlayerManager {
    return new PlayerManager(this, playerId, aliasIds);
  }

  public set(game: Game): void {
    this._set(game);
  }

  public snapshot(): Game {
    return cloneDeep(this._pointer());
  }

  public async startTimer(): Promise<void> {
    const game = this._pointer();
    while (game.currentTimerSeconds && game.currentTimerSeconds > 0) {
      await sleep(1000);
      this.update(gameState => {
        if (gameState.currentTimerSeconds) {
          gameState.currentTimerSeconds -= 1;
        }
      });
    }
  }

  public update(mutativeCb: (game: Game) => void) {
    this._mutate(mutativeCb);
  }

  public updateCurrentRound(mutativeCb: (round: Round) => void): void {
    this.update((game) => {
      mutativeCb(game.rounds[this.currentRound().idx])
    })
  }

  public updatePlayer(playerId: string, mutativeCb: (player: Player) => void) {
    this.managePlayer(playerId).update(mutativeCb);
  }
}