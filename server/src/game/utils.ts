import { chunk, shuffle } from "lodash";
import { Player, PlayerRoomAllocation, RolesCount, RoomName } from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";

export const assignRolesToPlayers = (rolesCount: Partial<RolesCount>, players: Record<string, Partial<Player>>): void => {
  const keysToShuffle = Object.keys(rolesCount).reduce(
    (acc, currRoleKey) => [...acc, ...Array(rolesCount[currRoleKey as RoleKey]).fill(currRoleKey)],
    [] as RoleKey[]
  )

  const playerIds = Object.keys(players);
  const shuffledRoleKeys = shuffle(keysToShuffle);

  for (let idx = 0; idx < playerIds.length; idx++) {
    const playerId = playerIds[idx];
    players[playerId].role = shuffledRoleKeys[idx]
  }
}

export const assignPlayersToRooms = (playerIds: string[]): PlayerRoomAllocation => {
  const shuffledIds = shuffle(playerIds);
  const firstRoomSize = Math.ceil(playerIds.length / 2);
  const [playersInA, playersInB] = chunk(shuffledIds, firstRoomSize);

  const result: PlayerRoomAllocation = {};

  for (let playerId of playersInA) {
    result[playerId] = RoomName.A;
  }

  for (let playerId of playersInB) {
    result[playerId] = RoomName.B
  }

  return result
}