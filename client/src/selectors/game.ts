import { createSelector } from 'reselect';
import { Game, RolesCount } from "../types/game.types";
import { ALL_ROLES, PlayerRole, RoleKey } from '../types/role.types';
import { alertsFromSetup, SetupAlertSeverity, SetupAlertSource } from '../utils/setup-utils';

export const selectGamePlayers = (game: Game) => game.players;
export const selectGameRolesInPlayCount = (game: Game): RolesCount => game.rolesCount;

export const selectTotalCountOfGameRoles = createSelector(
  selectGameRolesInPlayCount,
  (rolesCount) => Object.values(rolesCount).reduce((acc, val) => acc + val, 0)
)

export const selectGamePlayersList = createSelector(
  selectGamePlayers,
  players => Object.values(players)
)

export const selectGamePlayerCount = createSelector(
  selectGamePlayersList,
  list => list.length
)

export const selectGameSetupAlerts = createSelector(
  selectGameRolesInPlayCount,
  selectGamePlayerCount,
  (rolesCount, nPlayers) => alertsFromSetup(rolesCount, nPlayers)
)

export const selectGameSetupAlertsFromPlayerCount = createSelector(
  selectGameSetupAlerts,
  (alerts) => alerts.filter(({ source }) => source === SetupAlertSource.PLAYER_COUNT)
);

export const selectGameSetupAlertsFromRoleSetup = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ source }) => source === SetupAlertSource.ROLE_SETUP)
);

export const selectGameSetupErrors = createSelector(
  selectGameSetupAlerts,
  alerts => alerts.filter(({ severity }) => severity === SetupAlertSeverity.ERROR)
);

export const selectGameSetupWarnings = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ severity }) => severity === SetupAlertSeverity.WARNING)
);

export interface GameLobbyReadiness {
  isReady: boolean;
  reason?: string;
}

export const selectGameLobbyReadiness = createSelector(
  selectGamePlayerCount,
  count => count >= 6
    ? { isReady: true }
    : { isReady: false, reason: "Minimum 6 players needed" } 
)

export const selectGameRoleEntries = createSelector(
  selectGameRolesInPlayCount,
  (rolesCount) => Object.entries(rolesCount) as [RoleKey, number][]
)

export const selectGameRoleEntriesInGame = createSelector(
  selectGameRoleEntries,
  (entries) => entries.filter(([_, count]) => count > 0)
);

export const selectRolesInSetup = createSelector(
  selectGameRoleEntriesInGame,
  (entries) => entries.map(([roleKey, roleCount]) => [ALL_ROLES[roleKey], roleCount]) as [PlayerRole, number][]
)

export const selectRolesInSetupAlphabetised = createSelector(
  selectRolesInSetup,
  (roleEntries) => [...roleEntries].sort((a, b) => a[0].roleName < b[0].roleName ? -1 : 0)
)