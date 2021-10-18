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
export type Restricted<TRole extends PlayerRole> = TRole & { restrictions: RoleRestrictions }

export interface RoleRestrictions {
  max: number;
  min: number;
}

class RoleDefinition<TRole extends PlayerRole> {
  readonly key: TRole['key'];
  readonly team: TRole['team'];
  readonly roleName: TRole['roleName'];
  readonly restrictions: RoleRestrictions;

  constructor(
    { key, team, roleName }: TRole,
    { max = 1, min = 0 } = {}
  ) {
    this.key = key
    this.team = team;
    this.roleName = roleName;
    this.restrictions = { max, min }
  }

  toString(): `${RoleName} (${TeamName})` {
    return `${this.roleName} (${this.team})`;
  }
}

export const BLUE_ROLES: Record<BlueRoleKey, Restricted<BlueRole>> = {

  CLOWN_BLUE: new RoleDefinition({
    key: 'CLOWN_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.CLOWN
  }),

  DOCTOR_BLUE: new RoleDefinition({
    key: 'DOCTOR_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.DOCTOR
  }),

  NURSE_BLUE: new RoleDefinition({
    key: 'NURSE_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.NURSE
  }),

  PRESIDENT_BLUE: new RoleDefinition({
    key: 'PRESIDENT_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.PRESIDENT
  }, { min: 1 }),

  PRESIDENTS_DAUGHTER_BLUE: new RoleDefinition({
    key: 'PRESIDENTS_DAUGHTER_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.PRESIDENTS_DAUGHTER
  }),

  TEAM_BLUE: new RoleDefinition({
    key: 'TEAM_BLUE',
    team: TeamName.BLUE,
    roleName: BlueRoleName.TEAM
  }, { max: Infinity })

};

export const RED_ROLES: Record<RedRoleKey, Restricted<RedRole>> = {
  CLOWN_RED: new RoleDefinition({
    key: "CLOWN_RED",
    team: TeamName.RED,
    roleName: RedRoleName.CLOWN,
  }),

  BOMBER_RED: new RoleDefinition({
    key: 'BOMBER_RED',
    team: TeamName.RED,
    roleName: RedRoleName.BOMBER
  }, { min: 1 }),

  ENGINEER_RED: new RoleDefinition({
    key: 'ENGINEER_RED',
    team: TeamName.RED,
    roleName: RedRoleName.ENGINEER
  }),

  MARTYR_RED: new RoleDefinition({
    key: 'MARTYR_RED',
    team: TeamName.RED,
    roleName: RedRoleName.MARTYR
  }),

  TEAM_RED: new RoleDefinition({
    key: 'TEAM_RED',
    team: TeamName.RED,
    roleName: RedRoleName.MARTYR
  }, { max: Infinity }),

  TINKERER_RED: new RoleDefinition({
    key: 'TINKERER_RED',
    team: TeamName.RED,
    roleName: RedRoleName.TINKERER
  })
};

export const GREY_ROLES: Record<GreyRoleKey, Restricted<GreyRole>> = {
  
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
