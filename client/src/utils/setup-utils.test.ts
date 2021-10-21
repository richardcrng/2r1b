import { RolesCount } from "../types/game.types"
import { DEFAULT_STARTING_ROLES_COUNT } from "./role-utils"
import { alertsFromRolesCount, checkOtherRoleCountRestrictions, checkOwnPlayerCountRoleRestrictions, checkOwnRoleCountRestrictions, checkPlayerCount, checkPlayerCountAgainstRoleCount, SetupAlertSeverity } from "./setup-utils"

describe('alertsFromRolesCount', () => {
  test('Given an unbalanced number of Red and Blue roles, errors and says that they must match', () => {
    const testRolesCount: RolesCount = {
      ...DEFAULT_STARTING_ROLES_COUNT,
      TEAM_BLUE: 10,
      TEAM_RED: 10,
      CLOWN_RED: 1
    }

    const result = alertsFromRolesCount(testRolesCount);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
    expect(result[0].message).toMatch(/[equal|match]/i)
  })

  test('Given an unbalanced number of Red Team and Blue Team, warns that Red Team should match Blue Team numbers', () => {
    const testRolesCount: RolesCount = {
      ...DEFAULT_STARTING_ROLES_COUNT,
      TEAM_BLUE: 5,
      TEAM_RED: 4,
      CLOWN_RED: 1 // to balance color numbers
    }

    const result = alertsFromRolesCount(testRolesCount);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('severity', SetupAlertSeverity.WARNING)
  })
})

describe("checkOtherRoleCountRestrictions", () => {
  describe("Roles that recommend each other", () => {
    describe("Red Team and Blue Team", () => {
      test("Warns that Red Team is recommended with Blue Team", () => {
        const result = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 1, TEAM_BLUE: 0 },
          "TEAM_RED"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/blue team/i);
      });

      test("Warns that Blue Team is recommended with Red Team", () => {
        const result = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 0, TEAM_BLUE: 1 },
          "TEAM_BLUE"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/red team/i);
      });

      test("No warning when both present in equal numbers", () => {
        const blueCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 1, TEAM_BLUE: 1 },
          "TEAM_BLUE"
        );

        const redCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 1, TEAM_BLUE: 1 },
          "TEAM_RED"
        );

        expect(blueCheck).toHaveLength(0);
        expect(redCheck).toHaveLength(0);
      });

      test("Warning when both present in unequal numbers - asymmetrically", () => {
        const blueCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 1, TEAM_BLUE: 2 },
          "TEAM_BLUE"
        );

        const redCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, TEAM_RED: 1, TEAM_BLUE: 2 },
          "TEAM_RED"
        );

        expect(blueCheck).toHaveLength(1);
        expect(redCheck).toHaveLength(0);
      });
    })

    describe("Doctor and Engineer", () => {
      test("Warns that Doctor is recommended with Engineer", () => {
        const result = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, DOCTOR_BLUE: 0, ENGINEER_RED: 1 },
          "ENGINEER_RED"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/doctor/i);
      });

      test("Warns that Engineer is recommended with Doctor", () => {
        const result = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, DOCTOR_BLUE: 1, ENGINEER_RED: 0 },
          "DOCTOR_BLUE"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/engineer/i);
      });

      test("No warning when both present", () => {
        const doctorCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, DOCTOR_BLUE: 1, ENGINEER_RED: 1 },
          "DOCTOR_BLUE"
        );

        const engineerCheck = checkOtherRoleCountRestrictions(
          { ...DEFAULT_STARTING_ROLES_COUNT, DOCTOR_BLUE: 1, ENGINEER_RED: 1 },
          "DOCTOR_BLUE"
        );

        expect(doctorCheck).toHaveLength(0);
        expect(engineerCheck).toHaveLength(0);
      });
    });
  })
});

describe('checkOwnPlayerCountRoleRestrictions', () => {
  test("Warning from including Private Eye in a game with more than 10 players", () => {
    const result = checkOwnPlayerCountRoleRestrictions(11, 'PRIVATE_EYE_GREY');
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.WARNING)
  })
})

describe('checkOwnRoleCountRestrictions', () => {
  test("Error with less than one President", () => {
    const result = checkOwnRoleCountRestrictions({ ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 0 }, 'PRESIDENT_BLUE')
    
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR)
  })

  test("Error with more than one President", () => {
    const result = checkOwnRoleCountRestrictions(
      { ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 2 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  test("No error with one President", () => {
    const result = checkOwnRoleCountRestrictions(
      { ...DEFAULT_STARTING_ROLES_COUNT, PRESIDENT_BLUE: 1 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(0);
  });
})

describe('checkPlayerCount', () => {
  it("Errors on fewer than 6 players", () => {
    const result = checkPlayerCount(5);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR)
  })

  it("Warns on fewer than 10 players", () => {
    const result = checkPlayerCount(9);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
  });

  it("Has no alerts on 10 or more players", () => {
    const result = checkPlayerCount(10);
    expect(result).toHaveLength(0);
  });
})

describe('checkPlayerCountAgainstRoleCount', () => {
  test("Error when 2+ fewer players than roles", () => {
    const result = checkPlayerCountAgainstRoleCount(7, 10);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR)
  })

  test("Warning about Burying when 1 more role than players", () => {
    const result = checkPlayerCountAgainstRoleCount(9, 10);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
    expect(result[0].message).toMatch(/bur[y|i]/i);
  });

  test("No error when players matches roles", () => {
    const result = checkPlayerCountAgainstRoleCount(10, 10);
    expect(result).toHaveLength(0);
  });

  test("Error when more players than roles", () => {
    const result = checkPlayerCountAgainstRoleCount(11, 10);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR)
  })

  test("No error when player count doesn't even clear minimum", () => {
    const result = checkPlayerCountAgainstRoleCount(4, 10);
    expect(result).toHaveLength(0);
  })
})