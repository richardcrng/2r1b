import {
  Game,
  Player,
} from "../../../client/src/types/game.types";
import { GameManager } from "../game/model";
import { getColors } from "../utils";

export const joinPlayerToGame = (
  gameId: string,
  playerData: Player
): void => {
  new GameManager(gameId).managePlayer(playerData.socketId).set({
    ...playerData,
    gameId,
    colors: getColors(5)
  });
};

export const updatePlayer = (
  gameId: string,
  playerData: Player
): void => {
  new GameManager(gameId).updatePlayer(playerData.socketId, (player) => {
    Object.assign(player, playerData);
  })
};
