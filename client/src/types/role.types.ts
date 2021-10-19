import { Optional } from "./util.typs";

export enum TeamColor {
  BLUE = "Blue",
  GREY = "Grey",
  RED = "Red",
}

export enum BlueRoleName {
  CLOWN = "Clown",
  DOCTOR = "Doctor",
  NURSE = "Nurse",
  PRESIDENT = "President",
  PRESIDENTS_DAUGHTER = "President's Daughter",
  TEAM = "Blue Team",
}

export enum RedRoleName {
  BOMBER = "Bomber",
  CLOWN = "Clown",
  ENGINEER = "Engineer",
  MARTYR = "Martyr",
  TINKERER = "Tinkerer",
  TEAM = "Red Team",
}

export enum GreyRoleName {
  GAMBLER = 'Gambler',
  PRIVATE_EYE = 'Private Eye'
}

export type RoleName = BlueRoleName | RedRoleName | GreyRoleName
export type BlueRoleKey = `${keyof typeof BlueRoleName}_BLUE`;
export type RedRoleKey = `${keyof typeof RedRoleName}_RED`;
export type GreyRoleKey = `${keyof typeof GreyRoleName}_GREY`;
export type RoleKey = BlueRoleKey | RedRoleKey | GreyRoleKey

export interface PlayerRoleBase {
  key: RoleKey;
  color: TeamColor;
  roleName: RoleName;
}

export interface BlueRole extends PlayerRoleBase {
  key: BlueRoleKey;
  color: TeamColor.BLUE;
  roleName: BlueRoleName;
}

export interface RedRole extends PlayerRoleBase {
  key: RedRoleKey;
  color: TeamColor.RED;
  roleName: RedRoleName;
}

export interface GreyRole extends PlayerRoleBase {
  key: GreyRoleKey;
  color: TeamColor.GREY;
  roleName: GreyRoleName;
}

export type PlayerRole = BlueRole | GreyRole | RedRole

export enum WinCondition {
  BLUE = "You win, with all Blue-aligned players, if the President survives (does not gain the 'dead' condition).",
  GAMBLER = "You win if, at the end of the final round, you can correctly predict whether the Blue or Red Team are going to win.",
  PRIVATE_EYE = "You win if, at the end of the final round, you can correctly predict the identity of the Buried card.",
  RED = "You win, with all Red-aligned players, if the President is killed (gains the 'dead' condition).",
}

export type FullyDefined<TRole extends PlayerRole> = TRole & {
  restrictions: RoleRestrictions;
  info: RoleInfo;
}

export interface RoleRestrictions {
  max: number;
  min: number;
  requires: Partial<Record<RoleKey, number>>;
  recommended: Partial<Record<RoleKey, number>>;
}

export interface RoleInfo {
  winCondition: WinCondition;
}

class RoleDefinition<TRole extends PlayerRole> {
  readonly key: TRole["key"];
  readonly color: TRole["color"];
  readonly roleName: TRole["roleName"];
  readonly restrictions: RoleRestrictions;
  readonly info: RoleInfo;

  static Blue(
    {
      key,
      roleName,
      winCondition = WinCondition.BLUE,
      ...restInfo
    }: Omit<BlueRole, "color"> & Optional<RoleInfo, "winCondition">,
    restrictions: Partial<RoleRestrictions> = {}
  ): RoleDefinition<BlueRole> {
    return new this(
      { key, roleName, color: TeamColor.BLUE, winCondition, ...restInfo },
      restrictions
    );
  }

  static Grey(
    {
      key,
      roleName,
      ...restInfo
    }: Omit<GreyRole, "color"> & RoleInfo,
    restrictions: Partial<RoleRestrictions> = {}
  ): RoleDefinition<GreyRole> {
    return new this(
      { key, roleName, color: TeamColor.GREY, ...restInfo },
      restrictions
    );
  }

  static Red(
    {
      key,
      roleName,
      winCondition = WinCondition.RED,
      ...restInfo
    }: Omit<RedRole, "color"> & Optional<RoleInfo, "winCondition">,
    restrictions: Partial<RoleRestrictions> = {}
  ): RoleDefinition<RedRole> {
    return new this(
      { key, roleName, color: TeamColor.RED, winCondition, ...restInfo },
      restrictions
    );
  }

  constructor(
    { key, color, roleName, ...info }: TRole & RoleInfo,
    {
      max = 1,
      min = 0,
      requires = {},
      recommended = {},
    }: Partial<RoleRestrictions> = {}
  ) {
    this.key = key;
    this.color = color;
    this.roleName = roleName;
    this.info = info;
    this.restrictions = { max, min, requires, recommended };
  }

  toString(): `${RoleName} (${TeamColor})` {
    return `${this.roleName} (${this.color})`;
  }
}

export const BLUE_ROLES: Record<BlueRoleKey, FullyDefined<BlueRole>> = {

  CLOWN_BLUE: RoleDefinition.Blue({
    key: 'CLOWN_BLUE',
    roleName: BlueRoleName.CLOWN
  }),

  DOCTOR_BLUE: RoleDefinition.Blue({
    key: 'DOCTOR_BLUE',
    roleName: BlueRoleName.DOCTOR
  }, { recommended: { ENGINEER_RED: 1 } }),

  NURSE_BLUE: RoleDefinition.Blue({
    key: 'NURSE_BLUE',
    roleName: BlueRoleName.NURSE
  }, { recommended: { TINKERER_RED: 1 } }),

  PRESIDENT_BLUE: RoleDefinition.Blue({
    key: 'PRESIDENT_BLUE',
    roleName: BlueRoleName.PRESIDENT
  }, { min: 1, requires: { BOMBER_RED: 1 } }),

  PRESIDENTS_DAUGHTER_BLUE: RoleDefinition.Blue({
    key: 'PRESIDENTS_DAUGHTER_BLUE',
    roleName: BlueRoleName.PRESIDENTS_DAUGHTER
  }, { recommended: { MARTYR_RED: 1 } }),

  TEAM_BLUE: RoleDefinition.Blue({
    key: 'TEAM_BLUE',
    roleName: BlueRoleName.TEAM
  }, { max: Infinity, recommended: { TEAM_RED: 1 } })

};

export const RED_ROLES: Record<RedRoleKey, FullyDefined<RedRole>> = {
  CLOWN_RED: RoleDefinition.Red({
    key: "CLOWN_RED",
    roleName: RedRoleName.CLOWN,
  }),

  BOMBER_RED: RoleDefinition.Red({
    key: 'BOMBER_RED',
    roleName: RedRoleName.BOMBER
  }, { min: 1, requires: { PRESIDENT_BLUE: 1 } }),

  ENGINEER_RED: RoleDefinition.Red({
    key: 'ENGINEER_RED',
    roleName: RedRoleName.ENGINEER
  }, { recommended: { DOCTOR_BLUE: 1 } }),

  MARTYR_RED: RoleDefinition.Red({
    key: 'MARTYR_RED',
    roleName: RedRoleName.MARTYR
  }, { recommended: { PRESIDENTS_DAUGHTER_BLUE: 1 } }),

  TEAM_RED: RoleDefinition.Red({
    key: 'TEAM_RED',
    roleName: RedRoleName.MARTYR
  }, { max: Infinity, recommended: { TEAM_BLUE: 1 } }),

  TINKERER_RED: RoleDefinition.Red({
    key: 'TINKERER_RED',
    roleName: RedRoleName.TINKERER
  }, { recommended: { NURSE_BLUE: 1 } })
};

export const GREY_ROLES: Record<GreyRoleKey, FullyDefined<GreyRole>> = {
  
  GAMBLER_GREY: new RoleDefinition({
    key: 'GAMBLER_GREY',
    color: TeamColor.GREY,
    roleName: GreyRoleName.GAMBLER,
    winCondition: WinCondition.GAMBLER
  }),

  PRIVATE_EYE_GREY: new RoleDefinition({
    key: 'PRIVATE_EYE_GREY',
    color: TeamColor.GREY,
    roleName: GreyRoleName.PRIVATE_EYE,
    winCondition: WinCondition.PRIVATE_EYE
  })

};

export const ALL_ROLES = { ...BLUE_ROLES, ...RED_ROLES, ...GREY_ROLES }
