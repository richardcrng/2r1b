
import { Player, RolesCount, RoomName } from '../../../client/src/types/game.types';
import { RoleKey } from '../../../client/src/types/role.types';
import { DEFAULT_STARTING_ROLES_COUNT } from '../../../client/src/utils/role-utils';
import { assignPlayersToRooms, assignRolesToPlayers } from './utils';

describe('assignPlayersToRooms', () => {
  test('splits six players equally between two rooms', () => {
    const result = assignPlayersToRooms(['1', '2', '3', '4', '5', '6']);
    const values = Object.values(result);
    expect(values).toHaveLength(6);
    expect(values.filter(val => val === RoomName.A)).toHaveLength(3);
    expect(values.filter((val) => val === RoomName.B)).toHaveLength(3);
  })

  test("splits seven players into room of 4 and 3", () => {
    const result = assignPlayersToRooms(["1", "2", "3", "4", "5", "6", "7"]);
    const values = Object.values(result);
    expect(values).toHaveLength(7);
    expect(values.filter((val) => val === RoomName.A)).toHaveLength(4);
    expect(values.filter((val) => val === RoomName.B)).toHaveLength(3);
  });
})

describe('assignRolesToPlayers', () => {
  test("Assigns 8 roles in simple 8 player setup", () => {
    const players: Record<string, Partial<Player>> = {
      a: {},
      b: {},
      c: {},
      d: {},
      e: {},
      f: {},
      g: {},
      h: {}
    }

    const rolesCount: Partial<RolesCount> = {
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      DOCTOR_BLUE: 1,
      ENGINEER_RED: 1,
      TEAM_BLUE: 2,
      TEAM_RED: 2
    }

    assignRolesToPlayers(rolesCount, players);

    expect(Object.keys(players)).toHaveLength(8);

    for (let playerId in players) {
      expect(typeof players[playerId].role).toBe('string');
      expect(["PRESIDENT_BLUE", "BOMBER_RED", "DOCTOR_BLUE", "ENGINEER_RED", "TEAM_BLUE", "TEAM_RED"]).toContain(players[playerId].role)
    }

    const assignedRoles = Object.values(players).map(({ role }) => role);

    for (let key in rolesCount) {
      const roleKey = key as RoleKey
      expect(assignedRoles.filter(role => role === roleKey).length).toBe(rolesCount[roleKey] as number)
    }
  })

  test("Assigns 8/9 roles in simple 8 player setup", () => {
    const players: Record<string, Partial<Player>> = {
      a: {},
      b: {},
      c: {},
      d: {},
      e: {},
      f: {},
      g: {},
      h: {},
    };

    const rolesCount: Partial<RolesCount> = {
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      VICE_PRESIDENT_BLUE: 1,
      TINKERER_RED: 1,
      TEAM_BLUE: 2,
      TEAM_RED: 2,
      PRIVATE_EYE_GREY: 1
    };

    assignRolesToPlayers(rolesCount, players);

    expect(Object.keys(players)).toHaveLength(8);

    for (let playerId in players) {
      expect(typeof players[playerId].role).toBe("string");
      expect([
        "PRESIDENT_BLUE",
        "BOMBER_RED",
        "VICE_PRESIDENT_BLUE",
        "TINKERER_RED",
        "TEAM_BLUE",
        "TEAM_RED",
        "PRIVATE_EYE_GREY"
      ]).toContain(players[playerId].role);
    }

    const assignedRoles = Object.values(players).map(({ role }) => role);

    for (let key in rolesCount) {
      const roleKey = key as RoleKey;
      expect(assignedRoles.filter((role) => role === roleKey).length).toBeLessThanOrEqual(
        rolesCount[roleKey] as number
      );
    }
  });
})