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
  TEAM = "Red Team",
  TINKERER = "Tinkerer",
}

export enum GreyRoleName {
  GAMBLER = 'Gambler',
  PRIVATE_EYE = 'Private Eye'
}

export type RoleName = BlueRoleName | RedRoleName | GreyRoleName

export interface PlayerRoleBase {
  team: TeamName;
  roleName: RoleName;
}

export interface BlueRole extends PlayerRoleBase {
  team: TeamName.BLUE;
  roleName: BlueRoleName;
}

export interface RedRole extends PlayerRoleBase {
  team: TeamName.RED;
  roleName: RedRoleName;
}

export interface GreyRole extends PlayerRoleBase {
  team: TeamName.GREY;
  roleName: GreyRoleName;
}

export type PlayerRole = BlueRole | GreyRole | RedRole

export const BLUE_ROLES_DICT = Object.fromEntries(
  (Object.keys(BlueRoleName) as (keyof typeof BlueRoleName)[]).map(
    (roleName) => [
      `${roleName}_${TeamName.BLUE}`,
      { team: TeamName.BLUE, roleName: BlueRoleName[roleName] },
    ]
  )
) as Record<`${keyof typeof BlueRoleName}_${TeamName.BLUE}`, BlueRole>;

export const GREY_ROLES_DICT = Object.fromEntries(
  (Object.keys(GreyRoleName) as (keyof typeof GreyRoleName)[]).map((roleName) => [
    `${roleName}_${TeamName.GREY}`,
    { team: TeamName.GREY, roleName: GreyRoleName[roleName] },
  ])
) as Record<`${keyof typeof GreyRoleName}_${TeamName.GREY}`, GreyRole>;

export const RED_ROLES_DICT = Object.fromEntries(
  (Object.keys(RedRoleName) as (keyof typeof RedRoleName)[]).map((roleName) => [
    `${roleName}_${TeamName.RED}`,
    { team: TeamName.RED, roleName: RedRoleName[roleName] },
  ])
) as Record<`${keyof typeof RedRoleName}_${TeamName.RED}`, RedRole>;

export const ALL_ROLES = { ...BLUE_ROLES_DICT, ...GREY_ROLES_DICT, ...RED_ROLES_DICT }

export type RoleKey = keyof typeof ALL_ROLES;

// export default class PlayerRole implements PlayerRoleBase {
//   readonly team: TeamName;
//   readonly roleName: RoleName;

//   static readonly BLUE_TEAM = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.BLUE_TEAM,
//   });

//   static readonly BOMBER = new PlayerRole({
//     team: TeamName.RED,
//     roleName: RoleName.BOMBER,
//   });

//   static readonly CLOWN_BLUE = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.CLOWN,
//   });

//   static readonly CLOWN_RED = new PlayerRole({
//     team: TeamName.RED,
//     roleName: RoleName.CLOWN,
//   });

//   static readonly DOCTOR = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.DOCTOR,
//   });

//   static readonly ENGINEER = new PlayerRole({
//     team: TeamName.RED,
//     roleName: RoleName.ENGINEER,
//   });

//   static readonly GAMBLER = new PlayerRole({
//     team: TeamName.GREY,
//     roleName: RoleName.GAMBLER,
//   });

//   static readonly NURSE = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.NURSE,
//   });

//   static readonly PRESIDENT = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.PRESIDENT,
//   });

//   static readonly PRESIDENTS_DAUGHTER = new PlayerRole({
//     team: TeamName.BLUE,
//     roleName: RoleName.PRESIDENTS_DAUGHTER,
//   });

//   static readonly PRIVATE_EYE = new PlayerRole({
//     team: TeamName.GREY,
//     roleName: RoleName.PRIVATE_EYE,
//   });

//   static readonly RED_TEAM = new PlayerRole({
//     team: TeamName.RED,
//     roleName: RoleName.RED_TEAM,
//   });

//   static readonly TINKERER = new PlayerRole({
//     team: TeamName.RED,
//     roleName: RoleName.TINKERER,
//   });

//   // private to disallow creating other instances of this type
//   private constructor(
//     { team, roleName }: PlayerRoleBase
//   ) {
//     this.team = team;
//     this.roleName = roleName;
//   }

//   toString(): `${RoleName} (${TeamName})` {
//     return `${this.roleName} (${this.team})`;
//   }
// }