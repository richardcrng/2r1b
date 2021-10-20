import { ALL_ROLES, RoleKey } from "../types/role.types";


export const getRoleRestrictions = (roleKey: RoleKey) => ALL_ROLES[roleKey].restrictions

export const getRoleRemovability = (roleKey: RoleKey, currentCount: number) => {
  const { roleMin, roleMax } = getRoleRestrictions(roleKey);

  return {
    isAboveMin: currentCount > roleMin,
    isBelowMax: currentCount < roleMax
  }
}