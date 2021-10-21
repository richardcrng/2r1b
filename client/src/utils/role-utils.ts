import { RolesCount } from "../types/game.types";
import { ALL_ROLES, RoleKey } from "../types/role.types";
import { mapValues } from 'lodash';

export const getRoleDefinition = (roleKey: RoleKey) => ALL_ROLES[roleKey]

export const getRoleName = (roleKey: RoleKey) => getRoleDefinition(roleKey).roleName;

export const getRoleColor = (roleKey: RoleKey) => getRoleDefinition(roleKey).color;

export const getRoleRanking = (roleKey: RoleKey) => getRoleDefinition(roleKey).info.ranking

export const getRoleRestrictions = (roleKey: RoleKey) => getRoleDefinition(roleKey).restrictions

export const getRoleRemovability = (roleKey: RoleKey, currentCount: number) => {
  const { roleMin, roleMax } = getRoleRestrictions(roleKey);

  return {
    isAboveMin: currentCount > roleMin,
    isBelowMax: currentCount < roleMax
  }
}

export const DEFAULT_STARTING_ROLES_COUNT: RolesCount = mapValues(ALL_ROLES, (role) => role.restrictions.roleMin)