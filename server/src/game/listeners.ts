import {
  ClientEvent,
  ServerEvent,
  ServerSocket,
} from "../../../client/src/types/event.types";
import { incrementRoleInGame, createGame, startGame, appointLeader, proposeRoomLeader, offerAbdication, acceptAbdication, declineAbdication, withdrawAbdicationOffer, offerShare } from "./controllers";
import { joinPlayerToGame } from "../player/controllers";
import { GameManager } from "./model";

export const addGameListeners = (socket: ServerSocket): void => {

  socket.on(ClientEvent.ACCEPT_ABDICATION, acceptAbdication)

  socket.on(ClientEvent.APPOINT_ROOM_LEADER, appointLeader)

  socket.on(ClientEvent.DECLINE_ABDICATION, declineAbdication)

  socket.on(ClientEvent.INCREMENT_ROLE, incrementRoleInGame)

  socket.on(ClientEvent.CREATE_GAME, (data) => {
    const game = createGame(data);
    socket.emit(ServerEvent.GAME_CREATED, game);
  });

  socket.on(ClientEvent.GET_GAME, (gameId) => {
    const game = new GameManager(gameId).snapshot();
    game
      ? socket.emit(ServerEvent.GAME_GOTTEN, game.id, game)
      : socket.emit(ServerEvent.GAME_NOT_FOUND);
  });

  socket.on(ClientEvent.JOIN_GAME, joinPlayerToGame);

  socket.on(ClientEvent.OFFER_ABDICATION, offerAbdication);

  socket.on(ClientEvent.OFFER_SHARE, offerShare)

  socket.on(ClientEvent.PROPOSE_ROOM_LEADER, proposeRoomLeader)

  socket.on(ClientEvent.START_GAME, startGame);

  socket.on(ClientEvent.WITHDRAW_ABDICATION_OFFER, withdrawAbdicationOffer)
};
