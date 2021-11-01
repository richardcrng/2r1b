import {
  ClientEvent,
  ServerEvent,
  ServerSocket,
} from "../../../client/src/types/event.types";
import { GameManager } from "../game/model";
import { updatePlayer } from "./controllers";

export const addPlayerListeners = (
  socket: ServerSocket
): void => {
  socket.on(ClientEvent.GET_PLAYER, (gameId, playerId, aliasIds) => {
    const player = new GameManager(gameId).managePlayer(playerId, aliasIds)._pointer();
    player
      ? socket.emit(ServerEvent.PLAYER_GOTTEN, player.socketId, player)
      : socket.emit(ServerEvent.PLAYER_NOT_FOUND);
  });

  socket.on(ClientEvent.UPDATE_PLAYER, updatePlayer);
};
