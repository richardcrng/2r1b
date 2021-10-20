import { Optional } from "./util.typs";
import { WinCondition } from './role-responsibilities';

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
  VICE_PRESIDENT = "Vice-President",
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

export type FullyDefined<TRole extends PlayerRole> = TRole & {
  restrictions: Restrictions;
  info: RoleInfo;
}

export type Restrictions = RoleRestrictions & PlayerRestrictions

export interface RoleRestrictions {
  /** Maximum of this role */
  roleMax: number;
  /** Minimum of this role */
  roleMin: number;
  /** Other roles required in game */
  requires: Partial<Record<RoleKey, number>>;
  /** Other roles recommended in game */
  recommended: Partial<Record<RoleKey, number>>;
  /** Restrictions on player count */
}

export interface PlayerRestrictions {
  playerMax: number;
  playerMin: number;
  playerMaxRecommended: number;
  playerMinRecommended: number;
}

export enum RoleTag {
  ACTING = 'acting',
  BURY = 'bury',
  CARD_SHARE_POWER = 'card share power',
  CARD_SWAP = 'card swap',
  COLOR_SHARE_POWER = 'color share power',
  CONDITION = 'condition',
  CONTAGIOUS = 'contagious',
  PAUSES_GAME = 'pauses game',
  PRIVATE_REVEAL_POWER = 'private reveal power',
  PUBLIC_REVEAL_POWER = 'public reveal power'
}

export enum RoleRanking {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export interface RoleInfo<TCondition extends WinCondition = WinCondition> {
  ranking?: RoleRanking;
  pauseGameNumber?: number;
  winCondition: TCondition;
}

class RoleDefinition<TRole extends PlayerRole> {
  readonly key: TRole["key"];
  readonly color: TRole["color"];
  readonly roleName: TRole["roleName"];
  readonly restrictions: Restrictions;
  readonly info: RoleInfo;

  static Blue(
    {
      key,
      roleName,
      winCondition = "BLUE",
      ...restInfo
    }: Omit<BlueRole, "color"> & Optional<RoleInfo, "winCondition">,
    restrictions: Partial<Restrictions> = {}
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
      winCondition = roleName,
      ...restInfo
    }: Omit<GreyRole, "color"> & Optional<RoleInfo<GreyRoleName>, "winCondition">,
    restrictions: Partial<Restrictions> = {}
  ): RoleDefinition<GreyRole> {
    return new this(
      { key, roleName, color: TeamColor.GREY, winCondition, ...restInfo },
      restrictions
    );
  }

  static Red(
    {
      key,
      roleName,
      winCondition = "RED",
      ...restInfo
    }: Omit<RedRole, "color"> & Optional<RoleInfo, "winCondition">,
    restrictions: Partial<Restrictions> = {}
  ): RoleDefinition<RedRole> {
    return new this(
      { key, roleName, color: TeamColor.RED, winCondition, ...restInfo },
      restrictions
    );
  }

  constructor(
    { key, color, roleName, ...info }: TRole & RoleInfo,
    {
      roleMax = 1,
      roleMin = 0,
      requires = {},
      recommended = {},
      playerMax = Infinity,
      playerMaxRecommended = Infinity,
      playerMin = 0,
      playerMinRecommended = 0
    }: Partial<Restrictions> = {}
  ) {
    this.key = key;
    this.color = color;
    this.roleName = roleName;
    this.info = info;
    this.restrictions = { roleMax, roleMin, requires, recommended, playerMax, playerMaxRecommended, playerMin, playerMinRecommended };
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
  }, { recommended: { TINKERER_RED: 1 }, requires: { DOCTOR_BLUE: 1 } }),

  PRESIDENT_BLUE: RoleDefinition.Blue({
    key: 'PRESIDENT_BLUE',
    roleName: BlueRoleName.PRESIDENT,
    ranking: RoleRanking.PRIMARY
  }, { roleMin: 1 }),

  VICE_PRESIDENT_BLUE: RoleDefinition.Blue({
    key: 'VICE_PRESIDENT_BLUE',
    roleName: BlueRoleName.VICE_PRESIDENT,
    ranking: RoleRanking.SECONDARY
  }, { recommended: { MARTYR_RED: 1 } }),

  TEAM_BLUE: RoleDefinition.Blue({
    key: 'TEAM_BLUE',
    roleName: BlueRoleName.TEAM
  }, { roleMax: Infinity, recommended: { TEAM_RED: 1 } })

};

export const RED_ROLES: Record<RedRoleKey, FullyDefined<RedRole>> = {
  CLOWN_RED: RoleDefinition.Red({
    key: "CLOWN_RED",
    roleName: RedRoleName.CLOWN,
  }),

  BOMBER_RED: RoleDefinition.Red({
    key: 'BOMBER_RED',
    roleName: RedRoleName.BOMBER,
    ranking: RoleRanking.PRIMARY
  }, { roleMin: 1 }),

  ENGINEER_RED: RoleDefinition.Red({
    key: 'ENGINEER_RED',
    roleName: RedRoleName.ENGINEER
  }, { recommended: { DOCTOR_BLUE: 1 } }),

  MARTYR_RED: RoleDefinition.Red({
    key: 'MARTYR_RED',
    roleName: RedRoleName.MARTYR
  }, { recommended: { VICE_PRESIDENT_BLUE: 1 } }),

  TEAM_RED: RoleDefinition.Red({
    key: 'TEAM_RED',
    roleName: RedRoleName.TEAM
  }, { roleMax: Infinity, recommended: { TEAM_BLUE: 1 } }),

  TINKERER_RED: RoleDefinition.Red({
    key: 'TINKERER_RED',
    roleName: RedRoleName.TINKERER,
    ranking: RoleRanking.SECONDARY
  }, { recommended: { NURSE_BLUE: 1 }, requires: { ENGINEER_RED: 1 } })
};

export const GREY_ROLES: Record<GreyRoleKey, FullyDefined<GreyRole>> = {
  
  GAMBLER_GREY: RoleDefinition.Grey({
    key: 'GAMBLER_GREY',
    roleName: GreyRoleName.GAMBLER,
    pauseGameNumber: 10
  }),

  PRIVATE_EYE_GREY: RoleDefinition.Grey({
    key: 'PRIVATE_EYE_GREY',
    roleName: GreyRoleName.PRIVATE_EYE,
    pauseGameNumber: 5
  }, { playerMaxRecommended: 10 })

};

export const ALL_ROLES = { ...BLUE_ROLES, ...RED_ROLES, ...GREY_ROLES }
export const ALL_ROLE_KEYS = Object.keys(ALL_ROLES) as RoleKey[];
export const ALPHABETISED_ROLE_VALUES = Object.freeze(
  Object.values(ALL_ROLES).sort((a, b) => (a.roleName < b.roleName ? -1 : 1))
);
