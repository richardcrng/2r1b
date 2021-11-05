import {
  ClientEvent,
  ClientEventListeners,
  ServerEvent,
  ServerSocket,
} from "../../client/src/types/event.types";
import { incrementRoleInGame, startGame, appointLeader, proposeRoomLeader, offerAbdication, acceptAbdication, declineAbdication, withdrawAbdicationOffer, offerShare, withdrawShareOffer, declineShare, acceptShare, terminateShare, deselectHostage, selectHostage, submitHostages } from "./game/controllers";
import { joinPlayerToGame, updatePlayer } from "./player/controllers";
import { GameManager } from "./game/model";

export const addListeners = (socket: ServerSocket): void => {

  const listeners: ClientEventListeners = {
    [ClientEvent.ACCEPT_ABDICATION]: acceptAbdication,
    [ClientEvent.ACCEPT_SHARE]: acceptShare,
    [ClientEvent.APPOINT_ROOM_LEADER]: appointLeader,
    [ClientEvent.CREATE_GAME]: (socketId, playerName) => {
      const gameManager = GameManager.hostNew(socketId, playerName)
      socket.emit(ServerEvent.GAME_CREATED, gameManager._pointer()!);
    },
    [ClientEvent.DECLINE_ABDICATION]: declineAbdication,
    [ClientEvent.DECLINE_SHARE]: declineShare,
    [ClientEvent.DESELECT_HOSTAGE]: deselectHostage,
    [ClientEvent.GET_GAME]: (gameId) => {
      const game = new GameManager(gameId)._pointer();
      game
        ? socket.emit(ServerEvent.GAME_GOTTEN, game.id, game)
        : socket.emit(ServerEvent.GAME_NOT_FOUND);
    },
    [ClientEvent.GET_PLAYER]: (gameId, playerId, aliasIds) => {
      const player = new GameManager(gameId)
        .managePlayer(playerId, aliasIds)
        ._pointer();
      player
        ? socket.emit(ServerEvent.PLAYER_GOTTEN, player.socketId, player)
        : socket.emit(ServerEvent.PLAYER_NOT_FOUND);
    },
    [ClientEvent.INCREMENT_ROLE]: incrementRoleInGame,
    [ClientEvent.JOIN_GAME]: joinPlayerToGame,
    [ClientEvent.OFFER_ABDICATION]: offerAbdication,
    [ClientEvent.OFFER_SHARE]: offerShare,
    [ClientEvent.PROPOSE_ROOM_LEADER]: proposeRoomLeader,
    [ClientEvent.SELECT_HOSTAGE]: selectHostage,
    [ClientEvent.START_GAME]: startGame,
    [ClientEvent.SUBMIT_HOSTAGES]: submitHostages,
    [ClientEvent.TERMINATE_SHARE]: terminateShare,
    [ClientEvent.UPDATE_PLAYER]: updatePlayer,
    [ClientEvent.WITHDRAW_ABDICATION_OFFER]: withdrawAbdicationOffer,
    [ClientEvent.WITHDRAW_SHARE_OFFER]: withdrawShareOffer,
  };

  for (let [event, listener] of Object.entries(listeners) as [ClientEvent, ClientEventListeners[ClientEvent]][]) {
    socket.on(event, listener)
  }
};
