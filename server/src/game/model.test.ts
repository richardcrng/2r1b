import { RolesCount, RoomName } from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import {
  createDummyGame,
  createDummyPlayers,
} from "../../../client/src/utils/data-utils";
import { GameManager } from "./model";

describe("assignPlayersToRooms", () => {
  test("splits six players equally between two rooms", () => {
    const testGame = createDummyGame({
      players: createDummyPlayers(6),
    });
    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });
    gameManager.assignInitialRooms();
    const roomAllocationValues = Object.values(
      gameManager.snapshot()?.rounds[1].playerAllocation ?? {}
    );
    expect(roomAllocationValues).toHaveLength(6);
    expect(
      roomAllocationValues.filter((val) => val === RoomName.A)
    ).toHaveLength(3);
    expect(
      roomAllocationValues.filter((val) => val === RoomName.B)
    ).toHaveLength(3);
  });

  test("splits seven players into room of 4 and 3", () => {
    const testGame = createDummyGame({
      players: createDummyPlayers(7),
    });
    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });
    gameManager.assignInitialRooms();
    const roomAllocationValues = Object.values(
      gameManager.snapshot()?.rounds[1].playerAllocation ?? {}
    );
    expect(roomAllocationValues).toHaveLength(7);
    expect(
      roomAllocationValues.filter((val) => val === RoomName.A)
    ).toHaveLength(4);
    expect(
      roomAllocationValues.filter((val) => val === RoomName.B)
    ).toHaveLength(3);
  });
});

describe("assignInitialRoles", () => {
  test("Assigns 8 roles in simple 8 player setup", () => {
    const testRolesCount: Partial<RolesCount> = {
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      DOCTOR_BLUE: 1,
      ENGINEER_RED: 1,
      TEAM_BLUE: 2,
      TEAM_RED: 2,
    };

    const testGame = createDummyGame({
      players: createDummyPlayers(8),
      rolesCount: testRolesCount,
    });
    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });

    gameManager.assignInitialRoles();

    const players = gameManager.players();

    expect(Object.keys(players)).toHaveLength(8);
    for (const playerId in players) {
      expect(typeof players[playerId].role).toBe("string");
      expect([
        "PRESIDENT_BLUE",
        "BOMBER_RED",
        "DOCTOR_BLUE",
        "ENGINEER_RED",
        "TEAM_BLUE",
        "TEAM_RED",
      ]).toContain(players[playerId].role);
    }

    const assignedRoles = Object.values(players).map(({ role }) => role);

    for (const key in testRolesCount) {
      const roleKey = key as RoleKey;
      expect(assignedRoles.filter((role) => role === roleKey).length).toBe(
        testRolesCount[roleKey] as number
      );
    }
  });

  test("Assigns 8/9 roles in simple 8 player setup", () => {
    const testRolesCount: Partial<RolesCount> = {
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      VICE_PRESIDENT_BLUE: 1,
      TINKERER_RED: 1,
      TEAM_BLUE: 2,
      TEAM_RED: 2,
      PRIVATE_EYE_GREY: 1,
    };

    const testGame = createDummyGame({
      players: createDummyPlayers(8),
      rolesCount: testRolesCount,
    });
    const gameManager = new GameManager(testGame.id, {
      [testGame.id]: testGame,
    });

    gameManager.assignInitialRoles();

    const players = gameManager.players();
    expect(Object.keys(players)).toHaveLength(8);

    for (const playerId in players) {
      expect(typeof players[playerId].role).toBe("string");
      expect([
        "PRESIDENT_BLUE",
        "BOMBER_RED",
        "VICE_PRESIDENT_BLUE",
        "TINKERER_RED",
        "TEAM_BLUE",
        "TEAM_RED",
        "PRIVATE_EYE_GREY",
      ]).toContain(players[playerId].role);
    }

    const assignedRoles = Object.values(players).map(({ role }) => role);

    for (const key in testRolesCount) {
      const roleKey = key as RoleKey;
      expect(
        assignedRoles.filter((role) => role === roleKey).length
      ).toBeLessThanOrEqual(testRolesCount[roleKey] as number);
    }
  });
});
