import { RolesCount } from "../types/game.types"
import { DEFAULT_STARTING_ROLES_COUNT } from "./role-utils"
import { alertsFromRolesCount, checkOtherRoleCountRestrictions, checkOwnRoleCountRestrictions, SetupAlertSeverity } from "./setup-utils"


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