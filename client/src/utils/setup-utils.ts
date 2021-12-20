import { createRolesCount } from "./data-utils";
import { GameSettings, RolesCount } from "../types/game.types";
import { RoleKey, TeamColor } from "../types/role.types";
import {
  getRoleColor,
  getRoleDefinition,
  getRoleName,
  getRoleRestrictions,
} from "./role-utils";

const MINIMUM_PLAYERS_NEEDED = 6;
const MINIMUM_PLAYERS_RECOMMENDED = 10;

export enum SetupAlertSeverity {
  ERROR = "error",
  WARNING = "warning",
}

export enum SetupAlertSource {
  PLAYER_COUNT = "player count",
  ROLE_SETUP = "role setup",
}

export interface SetupAlert {
  severity: SetupAlertSeverity;
  message: string;
  source: SetupAlertSource;
}

export const alertsFromSetup = (
  rolesCount: RolesCount,
  nPlayers: number,
  settings: GameSettings = { colorSharing: false }
): SetupAlert[] => [
  ...alertsFromPlayersCount(rolesCount, nPlayers),
  ...alertsFromRolesCount(rolesCount),
  ...alertsFromSettings(settings, nPlayers),
];

export const alertsFromPlayersCount = (
  rolesCount: RolesCount,
  nPlayers: number
): SetupAlert[] => {
  const roleKeys = Object.keys(rolesCount) as RoleKey[];
  const totalRolesCount = Object.values(rolesCount).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const roleAlerts = roleKeys.reduce(
    (acc, currRoleKey) => [
      ...acc,
      ...checkOwnPlayerCountRoleRestrictions(nPlayers, currRoleKey),
    ],
    [] as SetupAlert[]
  );

  const alerts = [
    ...checkPlayerCount(nPlayers),
    ...checkPlayerCountAgainstRoleCount(nPlayers, totalRolesCount),
    ...roleAlerts,
  ];

  const isBurying = totalRolesCount === nPlayers + 1;

  if (isBurying) {
    if (rolesCount["VICE_PRESIDENT_BLUE"] === 0) {
      alerts.push({
        severity: SetupAlertSeverity.ERROR,
        message: `If a role will be buried, you must include the ${getRoleName(
          "VICE_PRESIDENT_BLUE"
        )} role`,
        source: SetupAlertSource.ROLE_SETUP,
      });
    }

    if (rolesCount["MARTYR_RED"] === 0) {
      alerts.push({
        severity: SetupAlertSeverity.ERROR,
        message: `If a role will be buried, you must include the ${getRoleName(
          "MARTYR_RED"
        )} role`,
        source: SetupAlertSource.ROLE_SETUP,
      });
    }
  } else {
    if (rolesCount.PRIVATE_EYE_GREY === 1) {
      alerts.push({
        severity: SetupAlertSeverity.ERROR,
        message: `Can't include ${getRoleName(
          "PRIVATE_EYE_GREY"
        )} if no role is getting buried`,
        source: SetupAlertSource.ROLE_SETUP,
      });
    }
  }

  return alerts;
};

export const alertsFromRolesCount = (rolesCount: RolesCount): SetupAlert[] => {
  const roleKeys = Object.keys(rolesCount) as RoleKey[];

  const alerts = roleKeys.reduce(
    (acc, currRoleKey) => [
      ...acc,
      ...checkOwnRoleCountRestrictions(rolesCount, currRoleKey),
      ...checkOtherRoleCountRestrictions(rolesCount, currRoleKey),
    ],
    [] as SetupAlert[]
  );

  return [...checkTeamBalance(rolesCount), ...alerts];
};

export const alertsFromSettings = (
  settings: GameSettings,
  nPlayers: number
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  if (nPlayers <= 10 && settings.colorSharing) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: "Color sharing is not recommended with 10 or fewer players",
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  return alerts;
};

export const checkOtherRoleCountRestrictions = (
  partialRolesCount: Partial<RolesCount>,
  roleKey: RoleKey
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const rolesCount = createRolesCount(partialRolesCount);
  const countOfThisRole = rolesCount[roleKey];
  const { recommended, requires } = getRoleRestrictions(roleKey);
  const { color, roleName } = getRoleDefinition(roleKey);
  const recommendedRoleEntries = Object.entries(recommended) as [
    RoleKey,
    number
  ][];
  const requiredRoleEntries = Object.entries(requires) as [RoleKey, number][];

  for (const [otherKey, otherCountPerRole] of recommendedRoleEntries) {
    const { color: otherColor, roleName: otherRoleName } =
      getRoleDefinition(otherKey);
    const expectedCount = countOfThisRole * otherCountPerRole;
    if (rolesCount[otherKey] < expectedCount) {
      alerts.push({
        severity: SetupAlertSeverity.WARNING,
        message: `${otherCountPerRole} ${otherRoleName} (${otherColor}) is recommended for each ${roleName} (${color})`,
        source: SetupAlertSource.ROLE_SETUP,
      });
    }
  }

  for (const [otherKey, otherCountPerRole] of requiredRoleEntries) {
    const { color: otherColor, roleName: otherRoleName } =
      getRoleDefinition(otherKey);
    const expectedCount = countOfThisRole * otherCountPerRole;
    if (rolesCount[otherKey] < expectedCount) {
      alerts.push({
        severity: SetupAlertSeverity.ERROR,
        message: `${otherCountPerRole} ${otherRoleName} (${otherColor}) is required for each ${roleName} (${color})`,
        source: SetupAlertSource.ROLE_SETUP,
      });
    }
  }

  return alerts;
};

export const checkOwnRoleCountRestrictions = (
  partialRolesCount: Partial<RolesCount>,
  roleKey: RoleKey
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const rolesCount = createRolesCount(partialRolesCount);
  const roleCount = rolesCount[roleKey] ?? 0;
  const { roleMax, roleMin } = getRoleRestrictions(roleKey);
  const { color, roleName } = getRoleDefinition(roleKey);

  if (roleCount > roleMax) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Maximum ${roleMax} allowed of ${roleName} (${color})`,
      source: SetupAlertSource.ROLE_SETUP,
    });
  } else if (roleCount < roleMin) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Minimum ${roleMin} needed of ${roleName} (${color})`,
      source: SetupAlertSource.ROLE_SETUP,
    });
  }

  return alerts;
};

export const checkOwnPlayerCountRoleRestrictions = (
  nPlayers: number,
  roleKey: RoleKey
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const { playerMax, playerMaxRecommended, playerMin, playerMinRecommended } =
    getRoleRestrictions(roleKey);
  const { color, roleName } = getRoleDefinition(roleKey);

  if (nPlayers > playerMax) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Maximum ${nPlayers} allowed for ${roleName} (${color})`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  if (nPlayers > playerMaxRecommended) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `Maximum ${nPlayers} recommended for ${roleName} (${color})`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  if (nPlayers < playerMin) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Minimum ${nPlayers} needed for ${roleName} (${color})`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  if (nPlayers < playerMinRecommended) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `Minimum ${nPlayers} recommended for ${roleName} (${color})`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  return alerts;
};

export const checkPlayerCount = (nPlayers: number): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  if (nPlayers < MINIMUM_PLAYERS_NEEDED) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `At least ${MINIMUM_PLAYERS_NEEDED} players are needed`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  } else if (nPlayers < MINIMUM_PLAYERS_RECOMMENDED) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `At least ${MINIMUM_PLAYERS_RECOMMENDED} players are recommended`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  return alerts;
};

export const checkPlayerCountAgainstRoleCount = (
  nPlayers: number,
  totalRolesCount: number
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  // don't bother when there aren't even enough players
  if (nPlayers < MINIMUM_PLAYERS_NEEDED) return [];

  if (totalRolesCount < nPlayers) {
    const roleGap = nPlayers - totalRolesCount;
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `${roleGap} more role${
        roleGap > 1 ? "s" : ""
      } needed for player count`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  } else if (totalRolesCount === nPlayers + 1) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `1 role will be Buried at this player count`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  } else if (totalRolesCount > nPlayers + 1) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Max ${
        nPlayers + 1
      } roles allowed for a ${nPlayers} players game`,
      source: SetupAlertSource.PLAYER_COUNT,
    });
  }

  return alerts;
};

export const checkTeamBalance = (rolesCount: RolesCount): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  const roleKeys = Object.keys(rolesCount) as RoleKey[];
  let blueCount = 0;
  let redCount = 0;

  for (const roleKey of roleKeys) {
    const color = getRoleColor(roleKey);
    if (color === TeamColor.BLUE) {
      blueCount += rolesCount[roleKey];
    } else if (color === TeamColor.RED) {
      redCount += rolesCount[roleKey];
    }
  }

  if (blueCount !== redCount) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: "Blue and Red role counts must match",
      source: SetupAlertSource.ROLE_SETUP,
    });
  }

  return alerts;
};
