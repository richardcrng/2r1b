import { RolesCount } from "../types/game.types";
import { RoleKey } from "../types/role.types";
import { getRoleDefinition, getRoleRestrictions } from "./role-utils";

const MINIMUM_PLAYERS_NEEDED = 6;
const MINIMUM_PLAYERS_RECOMMENDED = 10;

export enum SetupAlertSeverity {
  ERROR = 'error',
  WARNING = 'warning'
}

export interface SetupAlert {
  severity: SetupAlertSeverity,
  message: string;
}

export const alertsFromSetup = (rolesCount: RolesCount, nPlayers: number): SetupAlert[] => [
  ...alertsFromPlayersCount(rolesCount, nPlayers),
  ...alertsFromRolesCount(rolesCount)
]

export const alertsFromPlayersCount = (rolesCount: RolesCount, nPlayers: number): SetupAlert[] => {
  const roleKeys = Object.keys(rolesCount) as RoleKey[];
  const totalRolesCount = Object.values(rolesCount).reduce((acc, curr) => acc + curr, 0);

  const alerts = roleKeys.reduce(
    (acc, currRoleKey) => [
      ...acc,
      ...checkOwnPlayerCountRoleRestrictions(nPlayers, currRoleKey),
    ],
    [] as SetupAlert[]
  );

  return [
    ...checkPlayerCount(nPlayers),
    ...checkPlayerCountAgainstRoleCount(nPlayers, totalRolesCount),
    ...alerts
  ]
};

export const alertsFromRolesCount = (rolesCount: RolesCount): SetupAlert[] => {
  const roleKeys = Object.keys(rolesCount) as RoleKey[];

  const alerts = roleKeys.reduce((acc, currRoleKey) => [
    ...acc,
    ...checkOwnRoleCountRestrictions(rolesCount, currRoleKey),
    ...checkOtherRoleCountRestrictions(rolesCount, currRoleKey)
  ], [] as SetupAlert[])

  return alerts
}

export const checkOtherRoleCountRestrictions = (
  rolesCount: RolesCount,
  roleKey: RoleKey
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const countOfThisRole = rolesCount[roleKey];
  const { recommended, requires } = getRoleRestrictions(roleKey);
  const { color, roleName } = getRoleDefinition(roleKey);
  const recommendedRoleEntries = Object.entries(recommended) as [RoleKey, number][];
  const requiredRoleEntries = Object.entries(requires) as [RoleKey, number][];

  for (let [otherKey, otherCountPerRole] of recommendedRoleEntries) {
    const { color: otherColor, roleName: otherRoleName } = getRoleDefinition(otherKey);
    const expectedCount = countOfThisRole * otherCountPerRole;
    if (rolesCount[otherKey] < expectedCount) {
      alerts.push({
        severity: SetupAlertSeverity.WARNING,
        message: `${otherCountPerRole} ${otherRoleName} (${otherColor}) is recommended for each ${roleName} (${color})`
      })
    }
  }

  for (let [otherKey, otherCountPerRole] of requiredRoleEntries) {
    const { color: otherColor, roleName: otherRoleName } =
      getRoleDefinition(otherKey);
    const expectedCount = countOfThisRole * otherCountPerRole;
    if (rolesCount[otherKey] < expectedCount) {
      alerts.push({
        severity: SetupAlertSeverity.ERROR,
        message: `${otherCountPerRole} ${otherRoleName} (${otherColor}) is required for each ${roleName} (${color})`,
      });
    }
  }

  return alerts;
};

export const checkOwnRoleCountRestrictions = (rolesCount: RolesCount, roleKey: RoleKey): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const roleCount = rolesCount[roleKey];
  const { roleMax, roleMin } = getRoleRestrictions(roleKey)
  const { color, roleName } = getRoleDefinition(roleKey)

  if (roleCount > roleMax) {
    alerts.push({ severity: SetupAlertSeverity.ERROR, message: `Maximum ${roleMax} allowed of ${roleName} (${color})` })
  } else if (roleCount < roleMin) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Minimum ${roleMin} needed of ${roleName} (${color})`,
    });
  }
  
  return alerts
}

export const checkOwnPlayerCountRoleRestrictions = (
  nPlayers: number,
  roleKey: RoleKey
): SetupAlert[] => {
  const alerts: SetupAlert[] = [];
  const { playerMax, playerMaxRecommended, playerMin, playerMinRecommended } = getRoleRestrictions(roleKey);
  const { color, roleName } = getRoleDefinition(roleKey);

  if (nPlayers > playerMax) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Maximum ${nPlayers} allowed for ${roleName} (${color})`,
    });
  }

  if (nPlayers > playerMaxRecommended) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `Maximum ${nPlayers} recommended for ${roleName} (${color})`,
    });
  }

  if (nPlayers < playerMin) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Minimum ${nPlayers} needed for ${roleName} (${color})`,
    });
  }

  if (nPlayers < playerMinRecommended) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `Minimum ${nPlayers} recommended for ${roleName} (${color})`,
    });
  }

  return alerts;
};

export const checkPlayerCount = (nPlayers: number): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  if (nPlayers < MINIMUM_PLAYERS_NEEDED) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `At least ${MINIMUM_PLAYERS_NEEDED} players are needed to play`
    })
  } else if (nPlayers < MINIMUM_PLAYERS_RECOMMENDED) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `At least ${MINIMUM_PLAYERS_NEEDED} players are recommended when playing`,
    });
  }

  return alerts
}

export const checkPlayerCountAgainstRoleCount = (nPlayers: number, totalRolesCount: number): SetupAlert[] => {
  const alerts: SetupAlert[] = [];

  // don't bother when there aren't even enough players
  if (nPlayers < MINIMUM_PLAYERS_NEEDED) return []

  if (totalRolesCount < nPlayers) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `${
        nPlayers - totalRolesCount
      } roles short for ${nPlayers} players`,
    });
  } else if (totalRolesCount === nPlayers + 1) {
    alerts.push({
      severity: SetupAlertSeverity.WARNING,
      message: `1 role will be Buried (${totalRolesCount} roles between ${nPlayers} players)`,
    });
  } else if (totalRolesCount > nPlayers + 1) {
    alerts.push({
      severity: SetupAlertSeverity.ERROR,
      message: `Max ${
        nPlayers + 1
      } roles allowed for a ${nPlayers} players game`,
    });
  }

  return alerts
}



