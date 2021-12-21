import { Game, RoomName } from "../types/game.types";
import { createDummyGame, createDummyPlayers } from "../utils/data-utils";
import { GameManager } from "../../../server/src/game/model";
import { TeamColor } from "../types/role.types";
import { selectTeamWinCheckResult } from "./endgame-selectors";

describe("selectTeamWinCheckResult", () => {
  test("Declares win for red team when Bomber is in same endgame room as President", () => {
    const testGame: Game = createDummyGame({
      players: createDummyPlayers(8),
      rolesCount: {
        PRESIDENT_BLUE: 1,
        BOMBER_RED: 1,
        TEAM_BLUE: 3,
        TEAM_RED: 3,
      },
    });

    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });

    gameManager.assignInitialRoles();

    const president = gameManager.getPlayersByRole("PRESIDENT_BLUE")[0];
    const bomber = gameManager.getPlayersByRole("BOMBER_RED")[0];

    gameManager._mutate((game) => {
      game.endgame.finalRooms = {
        [president.socketId]: RoomName.A,
        [bomber.socketId]: RoomName.A,
      };
    });

    const result = selectTeamWinCheckResult(testGame);
    expect(result.winningColor).toBe(TeamColor.RED);
  });

  test("Declares win for blue team when Bomber is not in the same endgame room as President", () => {
    const testGame: Game = createDummyGame({
      players: createDummyPlayers(8),
      rolesCount: {
        PRESIDENT_BLUE: 1,
        BOMBER_RED: 1,
        TEAM_BLUE: 3,
        TEAM_RED: 3,
      },
    });

    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });

    gameManager.assignInitialRoles();

    const president = gameManager.getPlayersByRole("PRESIDENT_BLUE")[0];
    const bomber = gameManager.getPlayersByRole("BOMBER_RED")[0];

    gameManager._mutate((game) => {
      game.endgame.finalRooms = {
        [president.socketId]: RoomName.A,
        [bomber.socketId]: RoomName.B,
      };
    });

    const result = selectTeamWinCheckResult(testGame);
    expect(result.winningColor).toBe(TeamColor.BLUE);
  });
});
