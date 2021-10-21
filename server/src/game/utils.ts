import { chunk, shuffle } from "lodash";
import { Game, PlayerRoomAllocation, RoomName } from "../../../client/src/types/game.types";


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