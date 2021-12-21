import {
  ClientEvent,
  ClientEventListeners,
  ServerEvent,
  ServerSocket,
} from "../../client/src/types/event.types";
import {
  incrementRoleInGame,
  startGame,
  appointLeader,
  proposeRoomLeader,
  offerAbdication,
  acceptAbdication,
  declineAbdication,
  withdrawAbdicationOffer,
  offerShare,
  withdrawShareOffer,
  declineShare,
  acceptShare,
  terminateShare,
  deselectHostage,
  selectHostage,
  submitHostages,
  handleGamblerPrediction,
  revealResults,
  handlePrivateEyePrediction,
  resetGame,
  updateGameSettings,
  handleSniperShot,
  kickPlayer,
} from "./game/controllers";
import { joinPlayerToGame, updatePlayer } from "./player/controllers";
import { GameManager } from "./game/model";

export const addListeners = (socket: ServerSocket): void => {
  const listeners: ClientEventListeners = {
    [ClientEvent.ACCEPT_ABDICATION]: acceptAbdication,
    [ClientEvent.ACCEPT_SHARE]: acceptShare,
    [ClientEvent.APPOINT_ROOM_LEADER]: appointLeader,
    [ClientEvent.CREATE_GAME]: (socketId, playerName) => {
      const gameManager = GameManager.hostNew(socketId, playerName);
      const createdData = gameManager._pointer();
      if (createdData) {
        socket.emit(ServerEvent.GAME_CREATED, createdData);
      }
    },
    [ClientEvent.DECLINE_ABDICATION]: declineAbdication,
    [ClientEvent.DECLINE_SHARE]: declineShare,
    [ClientEvent.DESELECT_HOSTAGE]: deselectHostage,
    [ClientEvent.GAMBLER_PREDICT]: handleGamblerPrediction,
    [ClientEvent.GET_GAME]: (gameId) => {
      const game = GameManager.for(gameId)._pointer();
      game
        ? socket.emit(ServerEvent.GAME_GOTTEN, game.id, game)
        : socket.emit(ServerEvent.GAME_NOT_FOUND);
    },
    [ClientEvent.GET_PLAYER]: (gameId, playerId, aliasIds) => {
      const player = GameManager.for(gameId)
        .managePlayer(playerId, aliasIds)
        ._pointer();
      player
        ? socket.emit(ServerEvent.PLAYER_GOTTEN, player.socketId, player)
        : socket.emit(ServerEvent.PLAYER_NOT_FOUND);
    },
    [ClientEvent.INCREMENT_ROLE]: incrementRoleInGame,
    [ClientEvent.JOIN_GAME]: joinPlayerToGame,
    [ClientEvent.KICK_PLAYER]: kickPlayer,
    [ClientEvent.OFFER_ABDICATION]: offerAbdication,
    [ClientEvent.OFFER_SHARE]: offerShare,
    [ClientEvent.PRIVATE_EYE_PREDICT]: handlePrivateEyePrediction,
    [ClientEvent.PROPOSE_ROOM_LEADER]: proposeRoomLeader,
    [ClientEvent.RESET_GAME]: resetGame,
    [ClientEvent.REVEAL_RESULTS]: revealResults,
    [ClientEvent.SELECT_HOSTAGE]: selectHostage,
    [ClientEvent.SNIPER_SHOT]: handleSniperShot,
    [ClientEvent.START_GAME]: startGame,
    [ClientEvent.SUBMIT_HOSTAGES]: submitHostages,
    [ClientEvent.TERMINATE_SHARE]: terminateShare,
    [ClientEvent.UPDATE_PLAYER]: updatePlayer,
    [ClientEvent.UPDATE_GAME_SETTINGS]: updateGameSettings,
    [ClientEvent.WITHDRAW_ABDICATION_OFFER]: withdrawAbdicationOffer,
    [ClientEvent.WITHDRAW_SHARE_OFFER]: withdrawShareOffer,
  };

  for (const [event, listener] of Object.entries(listeners) as [
    ClientEvent,
    ClientEventListeners[ClientEvent]
  ][]) {
    socket.on(event, listener);
  }
};
