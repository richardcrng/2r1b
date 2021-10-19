export enum TeamName {
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
  team: TeamName;
  roleName: RoleName;
}

export interface BlueRole extends PlayerRoleBase {
  key: BlueRoleKey;
  team: TeamName.BLUE;
  roleName: BlueRoleName;
}

export interface RedRole extends PlayerRoleBase {
  key: RedRoleKey;
  team: TeamName.RED;
  roleName: RedRoleName;
}

export interface GreyRole extends PlayerRoleBase {
  key: GreyRoleKey;
  team: TeamName.GREY;
  roleName: GreyRoleName;
}

export type PlayerRole = BlueRole | GreyRole | RedRole

export type FullyDefined<TRole extends PlayerRole> = TRole & {
  restrictions: RoleRestrictions;
  // info: RoleInfo;
}

export interface RoleRestrictions {
  max: number;
  min: number;
  requires: Partial<Record<RoleKey, number>>;
  recommended: Partial<Record<RoleKey, number>>;
}

export interface RoleInfo {
  winCondition: string;
}

class RoleDefinition<TRole extends PlayerRole> {
  readonly key: TRole["key"];
  readonly team: TRole["team"];
  readonly roleName: TRole["roleName"];
  readonly restrictions: RoleRestrictions;
  // readonly info: RoleInfo;

  static Blue(
    role: Omit<BlueRole, "team">,
    restrictions?: Partial<RoleRestrictions>
  ): RoleDefinition<BlueRole> {
    return new this({ ...role, team: TeamName.BLUE }, restrictions);
  }

  static Red(
    role: Omit<RedRole, "team">,
    restrictions?: Partial<RoleRestrictions>
  ): RoleDefinition<RedRole> {
    return new this({ ...role, team: TeamName.RED }, restrictions);
  }

  constructor(
    { key, team, roleName }: TRole,
    {
      max = 1,
      min = 0,
      requires = {},
      recommended = {},
    }: Partial<RoleRestrictions> = {},
    { winCondition }: Partial<RoleInfo> = {}
  ) {
    this.key = key;
    this.team = team;
    this.roleName = roleName;
    this.restrictions = { max, min, requires, recommended };
  }

  toString(): `${RoleName} (${TeamName})` {
    return `${this.roleName} (${this.team})`;
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
    team: TeamName.GREY,
    roleName: GreyRoleName.GAMBLER
  }),

  PRIVATE_EYE_GREY: new RoleDefinition({
    key: 'PRIVATE_EYE_GREY',
    team: TeamName.GREY,
    roleName: GreyRoleName.PRIVATE_EYE
  })

};

export const ALL_ROLES = { ...BLUE_ROLES, ...RED_ROLES, ...GREY_ROLES }
