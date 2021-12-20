import {
  ALL_ROLES,
  FullyDefined,
  PlayerRole,
  Restrictions,
  RoleKey,
  RoleName,
  RoleRanking,
  TeamColor,
} from "../types/role.types";
import { mapValues } from "lodash";

export const getRoleDefinition = (roleKey: RoleKey): FullyDefined<PlayerRole> =>
  ALL_ROLES[roleKey];

export const getRoleName = (roleKey: RoleKey): RoleName =>
  getRoleDefinition(roleKey).roleName;

export const getRoleColor = (roleKey: RoleKey): TeamColor =>
  getRoleDefinition(roleKey).color;

export const getRoleRanking = (roleKey: RoleKey): RoleRanking | undefined =>
  getRoleDefinition(roleKey).info.ranking;

export const getRoleRestrictions = (roleKey: RoleKey): Restrictions =>
  getRoleDefinition(roleKey).restrictions;

export const getRoleRemovability = (
  roleKey: RoleKey,
  currentCount: number
): { isAboveMin: boolean; isBelowMax: boolean } => {
  const { roleMin, roleMax } = getRoleRestrictions(roleKey);

  return {
    isAboveMin: currentCount > roleMin,
    isBelowMax: currentCount < roleMax,
  };
};

export const DEFAULT_STARTING_ROLES_COUNT = Object.freeze(
  mapValues(ALL_ROLES, (role) => role.restrictions.roleMin)
);
