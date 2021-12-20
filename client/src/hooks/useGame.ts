import { useEffect } from "react";
import { bundle, useRiducer } from "riduce";
import { useSocket } from "../socket";
import { ClientEvent, ServerEvent } from "../types/event.types";
import { Game } from "../types/game.types";
import useSocketListener from "./useSocketListener";
import { toast } from "react-toastify";

interface UseGameResult {
  data: Game | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: UseGameResult = {
  loading: true,
  data: undefined,
  error: undefined,
};

export default function useGame(gameId: Game["id"]): UseGameResult {
  const socket = useSocket();
  const { state, dispatch, actions } = useRiducer(initialState);

  const setGame = (game: Game) => {
    dispatch(
      bundle([actions.data.create.update(game), actions.loading.create.off()])
    );
  };

  useEffect(() => {
    socket.emit(ClientEvent.GET_GAME, gameId);
  }, [socket, gameId]);

  useSocketListener(ServerEvent.GAME_GOTTEN, (updatedId, game) => {
    updatedId === gameId && setGame(game);
  });

  useSocketListener(ServerEvent.GAME_UPDATED, (updatedId, game) => {
    updatedId === gameId && setGame(game);
  });

  useSocketListener(ServerEvent.GAME_NOT_FOUND, () => {
    dispatch(
      bundle([
        actions.error.create.update("Game not found"),
        actions.loading.create.off(),
      ])
    );
  });

  useSocketListener(
    ServerEvent.GAME_NOTIFICATION,
    (notificationGameId, notification) => {
      if (notificationGameId === gameId) {
        toast(notification.message);
      }
    }
  );

  return state;
}
