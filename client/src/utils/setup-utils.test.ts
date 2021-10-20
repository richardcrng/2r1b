import { RolesCount } from "../types/game.types"
import { DEFAULT_STARTING_ROLES_COUNT } from "./role-utils"
import { alertsFromRolesCount, checkRoleCountRestrictions, SetupAlertSeverity } from "./setup-utils"


describe('alertsFromRolesCount', () => {
  test('Given an unbalanced number of Red Team and Blue Team, warns that Red Team should match Blue Team numbers', () => {
    const testRolesCount: RolesCount = {
      ...DEFAULT_STARTING_ROLES_COUNT,
      TEAM_BLUE: 5,
      TEAM_RED: 4
    }

    const result = alertsFromRolesCount(testRolesCount);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('severity', SetupAlertSeverity.WARNING)
  })
})

describe('checkRoleCountRestrictions', () => {
  test("Error with less than one President", () => {
    const result = checkRoleCountRestrictions({ ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 0 }, 'PRESIDENT_BLUE')
    
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR)
  })

  test("Error with more than one President", () => {
    const result = checkRoleCountRestrictions(
      { ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 2 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  test("No error with one President", () => {
    const result = checkRoleCountRestrictions(
      { ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 1 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(0);
  });
})