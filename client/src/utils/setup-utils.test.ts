import { createRolesCount } from "./data-utils";
import { RolesCount } from "../types/game.types";
import {
  alertsFromRolesCount,
  alertsFromSetup,
  checkOtherRoleCountRestrictions,
  checkOwnPlayerCountRoleRestrictions,
  checkOwnRoleCountRestrictions,
  checkPlayerCount,
  checkPlayerCountAgainstRoleCount,
  SetupAlertSeverity,
} from "./setup-utils";

describe("alertsFromSetup", () => {
  describe("6-10 player games", () => {
    describe("Color sharing", () => {
      test("Given 6 players and color sharing on, warns that color sharing is not recommended", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
          }),
          6,
          { colorSharing: true }
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.WARNING &&
              result.message.match(/color shar[e|ing]/i) &&
              result.message.match(/not recommend/i)
          )
        ).toBe(true);
      });

      test("Given 10 players and color sharing on, warns that color sharing is not recommended", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
          }),
          6,
          { colorSharing: true }
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.WARNING &&
              result.message.match(/color shar[e|ing]/i) &&
              result.message.match(/not recommend/i)
          )
        ).toBe(true);
      });

      test("Given 11 players and color sharing on, does not warn that color sharing is not recommended", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
          }),
          11,
          { colorSharing: true }
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.WARNING &&
              result.message.match(/color shar[e|ing]/i) &&
              result.message.match(/not recommend/i)
          )
        ).toBe(false);
      });
    });
  });

  describe("secondary roles", () => {
    describe("Vice-President", () => {
      test("Given that a role will not be buried, does not error if there is no Vice-President", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
          }),
          6
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.ERROR &&
              result.message.match(/buried/i) &&
              result.message.match(/vice-president/i)
          )
        ).toBe(false);
      });

      test("Given that a role will be buried, errors if there is no Vice-President", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
            PRIVATE_EYE_GREY: 1,
          }),
          6
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.ERROR &&
              result.message.match(/buried/i) &&
              result.message.match(/vice-president/i)
          )
        ).toBe(true);
      });
    });

    describe("Martyr", () => {
      test("Given that a role will not be buried, does not error if there is no Martyr", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
          }),
          6
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.ERROR &&
              result.message.match(/buried/i) &&
              result.message.match(/martyr/i)
          )
        ).toBe(false);
      });

      test("Given that a role will be buried, errors if there is no Martyr", () => {
        const result = alertsFromSetup(
          createRolesCount({
            PRESIDENT_BLUE: 1,
            BOMBER_RED: 1,
            TEAM_BLUE: 2,
            TEAM_RED: 2,
            PRIVATE_EYE_GREY: 1,
          }),
          6
        );

        expect(
          result.some(
            (result) =>
              result.severity === SetupAlertSeverity.ERROR &&
              result.message.match(/buried/i) &&
              result.message.match(/martyr/i)
          )
        ).toBe(true);
      });
    });
  });

  describe("Private Eye", () => {
    test("Given that a role will not be buried, errors if there is a Private Eye", () => {
      const result = alertsFromSetup(
        createRolesCount({
          PRESIDENT_BLUE: 1,
          PRIVATE_EYE_GREY: 1,
          TEAM_BLUE: 1,
          TEAM_RED: 1,
          MARTYR_RED: 1,
          VICE_PRESIDENT_BLUE: 1,
        }),
        6
      );

      expect(
        result.some(
          (result) =>
            result.severity === SetupAlertSeverity.ERROR &&
            result.message.match(/private eye/i) &&
            result.message.match(/buried/i)
        )
      ).toBe(true);
    });

    test("Given that a role will be buried, does not error for Private Eye", () => {
      const result = alertsFromSetup(
        createRolesCount({
          PRESIDENT_BLUE: 1,
          PRIVATE_EYE_GREY: 1,
          TEAM_BLUE: 1,
          TEAM_RED: 1,
          MARTYR_RED: 1,
          VICE_PRESIDENT_BLUE: 1,
          GAMBLER_GREY: 1,
        }),
        6
      );

      expect(
        result.some(
          (result) =>
            result.severity === SetupAlertSeverity.ERROR &&
            result.message.match(/private eye/i) &&
            result.message.match(/buried/i)
        )
      ).toBe(false);
    });
  });
});

describe("alertsFromRolesCount", () => {
  test("Given an unbalanced number of Red and Blue roles, errors and says that they must match", () => {
    const testRolesCount: RolesCount = createRolesCount({
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      TEAM_BLUE: 10,
      TEAM_RED: 10,
      CLOWN_RED: 1,
    });

    const result = alertsFromRolesCount(testRolesCount);
    expect(
      result.some(
        (alert) =>
          alert.severity === SetupAlertSeverity.ERROR &&
          alert.message.match(/[equal|match]/i)
      )
    ).toBe(true);
  });

  test("Given an unbalanced number of Red Team and Blue Team, warns that Red Team should match Blue Team numbers", () => {
    const testRolesCount: RolesCount = createRolesCount({
      PRESIDENT_BLUE: 1,
      BOMBER_RED: 1,
      TEAM_BLUE: 5,
      TEAM_RED: 4,
      CLOWN_RED: 1, // to balance color numbers
    });

    const result = alertsFromRolesCount(testRolesCount);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("severity", SetupAlertSeverity.WARNING);
  });
});

describe("checkOtherRoleCountRestrictions", () => {
  describe("Roles that recommend each other", () => {
    describe("Red Team and Blue Team", () => {
      test("Warns that Red Team is recommended with Blue Team", () => {
        const result = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 1, TEAM_BLUE: 0 },
          "TEAM_RED"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/blue team/i);
      });

      test("Warns that Blue Team is recommended with Red Team", () => {
        const result = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 0, TEAM_BLUE: 1 },
          "TEAM_BLUE"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/red team/i);
      });

      test("No warning when both present in equal numbers", () => {
        const blueCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 1, TEAM_BLUE: 1 },
          "TEAM_BLUE"
        );

        const redCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 1, TEAM_BLUE: 1 },
          "TEAM_RED"
        );

        expect(blueCheck).toHaveLength(0);
        expect(redCheck).toHaveLength(0);
      });

      test("Warning when both present in unequal numbers - asymmetrically", () => {
        const blueCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 1, TEAM_BLUE: 2 },
          "TEAM_BLUE"
        );

        const redCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, TEAM_RED: 1, TEAM_BLUE: 2 },
          "TEAM_RED"
        );

        expect(blueCheck).toHaveLength(1);
        expect(redCheck).toHaveLength(0);
      });
    });

    describe("Doctor and Engineer", () => {
      test("Warns that Doctor is recommended with Engineer", () => {
        const result = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, DOCTOR_BLUE: 0, ENGINEER_RED: 1 },
          "ENGINEER_RED"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/doctor/i);
      });

      test("Warns that Engineer is recommended with Doctor", () => {
        const result = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, DOCTOR_BLUE: 1, ENGINEER_RED: 0 },
          "DOCTOR_BLUE"
        );

        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
        expect(result[0].message).toMatch(/engineer/i);
      });

      test("No warning when both present", () => {
        const doctorCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, DOCTOR_BLUE: 1, ENGINEER_RED: 1 },
          "DOCTOR_BLUE"
        );

        const engineerCheck = checkOtherRoleCountRestrictions(
          { PRESIDENT_BLUE: 1, BOMBER_RED: 1, DOCTOR_BLUE: 1, ENGINEER_RED: 1 },
          "DOCTOR_BLUE"
        );

        expect(doctorCheck).toHaveLength(0);
        expect(engineerCheck).toHaveLength(0);
      });
    });
  });
});

describe("checkOwnPlayerCountRoleRestrictions", () => {
  test("Warning from including Private Eye in a game with more than 10 players", () => {
    const result = checkOwnPlayerCountRoleRestrictions(11, "PRIVATE_EYE_GREY");
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
  });
});

describe("checkOwnRoleCountRestrictions", () => {
  test("Error with less than one President", () => {
    const result = checkOwnRoleCountRestrictions(
      { PRESIDENT_BLUE: 0 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  test("Error with more than one President", () => {
    const result = checkOwnRoleCountRestrictions(
      { PRESIDENT_BLUE: 2 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  test("No error with one President", () => {
    const result = checkOwnRoleCountRestrictions(
      { PRESIDENT_BLUE: 1 },
      "PRESIDENT_BLUE"
    );

    expect(result).toHaveLength(0);
  });
});

describe("checkPlayerCount", () => {
  it("Errors on fewer than 6 players", () => {
    const result = checkPlayerCount(5);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  it("Warns on fewer than 10 players", () => {
    const result = checkPlayerCount(9);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.WARNING);
  });

  it("Has no alerts on 10 or more players", () => {
    const result = checkPlayerCount(10);
    expect(result).toHaveLength(0);
  });
});

describe("checkPlayerCountAgainstRoleCount", () => {
  test("Error when 2+ fewer players than roles", () => {
    const result = checkPlayerCountAgainstRoleCount(7, 10);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

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
    expect(result[0].severity).toBe(SetupAlertSeverity.ERROR);
  });

  test("No error when player count doesn't even clear minimum", () => {
    const result = checkPlayerCountAgainstRoleCount(4, 10);
    expect(result).toHaveLength(0);
  });
});
