import { Game, RolesCount } from "../types/game.types";
import { Restrictions, RoleKey } from "../types/role.types";
import { getRoleDefinition, getRoleRestrictions } from "./role-utils";


export enum SetupAlertSeverity {
  ERROR = 'error',
  WARNING = 'warning'
}

export interface SetupAlert {
  severity: SetupAlertSeverity,
  message: string;
}

export const alertsFromPlayersCount = (rolesCount: RolesCount, nPlayers: number): SetupAlert[] => {
  const roleKeys = Object.keys(rolesCount) as RoleKey[];

  const alerts = roleKeys.reduce(
    (acc, currRoleKey) => [
      ...acc,
      ...checkOwnRoleCountRestrictions(rolesCount, currRoleKey),
      ...checkOtherRoleCountRestrictions(rolesCount, currRoleKey),
    ],
    [] as SetupAlert[]
  );

  return alerts;
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

















