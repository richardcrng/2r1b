import { createSelector } from 'reselect';
import { Game, LeaderVote, PlayerWithRoom, RolesCount, RoomName, RoundStatus } from "../types/game.types";
import { ALL_ROLES, PlayerRole, RoleKey } from '../types/role.types';
import { alertsFromSetup, SetupAlertSeverity, SetupAlertSource } from '../utils/setup-utils';
import { mapValues, last } from 'lodash';

export const selectGamePlayers = (game: Game) => game.players;
export const selectGameRolesInPlayCount = (game: Game): RolesCount => game.rolesCount;
export const selectGameRounds = (game: Game) => game.rounds

export const selectTotalCountOfGameRoles = createSelector(
  selectGameRolesInPlayCount,
  (rolesCount) => Object.values(rolesCount).reduce((acc, val) => acc + val, 0)
)

export const selectGamePlayerIds = createSelector(
  selectGamePlayers,
  (players) => Object.keys(players)
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

export const selectCurrentGameRound = createSelector(
  selectGameRounds,
  (rounds) => rounds.find(round => round.status === RoundStatus.ONGOING)
)

export const selectCurrentGameRoomAllocation = createSelector(
  selectCurrentGameRound,
  (round) => round?.playerAllocation
);

export const selectGamePlayersWithRooms = createSelector(
  selectGamePlayers,
  selectCurrentGameRoomAllocation,
  (players, roomAllocation = {}): Record<string, PlayerWithRoom> => mapValues(players, (player) => ({
    ...player,
    room: roomAllocation[player.socketId] as RoomName | undefined
  }))
)

export const selectPlayerIdsInEachRoom = createSelector(
  selectGamePlayersWithRooms,
  (players): Record<RoomName, string[]> => Object.values(players).reduce(
    (acc, curr) => {
      if (curr.room) {
        return {
          ...acc,
          [curr.room]: [...acc[curr.room], curr.socketId]
        }
      } else {
        return acc
      }
    },
    { [RoomName.A]: [], [RoomName.B]: [] }
  )
);

export const selectCurrentRoundRooms = createSelector(
  selectCurrentGameRound,
  (round) => round?.rooms
)

export const selectCurrentRoomLeaderRecords = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, (room) => room.leadersRecord)
)

export const selectCurrentRoomCurrentLeaderRecord = createSelector(
  selectCurrentRoomLeaderRecords,
  (leaderRecordsDict) => mapValues(leaderRecordsDict, (leaderRecords) => last(leaderRecords))
)

export const selectCurrentRoomCurrentLeaders = createSelector(
  selectCurrentRoomCurrentLeaderRecord,
  (leaderRecordDict) =>
    mapValues(leaderRecordDict, (leaderRecord) => leaderRecord?.leaderId)
);

export const selectDictionaryOfVotesForPlayers = createSelector(
  selectGamePlayersList,
  (playerList): Record<string, LeaderVote[]> => {
    const votes: Record<string, LeaderVote[]> = Object.fromEntries(
      playerList.map(player => [player.socketId, []])
    )

    for (let player of playerList) {
      const currVote = player.leaderVote;
      if (currVote) {
        votes[currVote.proposedLeaderId].push(currVote)
      }
    }

    for (let playerId in votes) {
      votes[playerId].sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    }

    return votes
  }
)

export const selectOrderedVotesForPlayers = createSelector(
  selectDictionaryOfVotesForPlayers,
  (voteDictionary) => {
    const voteEntries = Object.entries(voteDictionary);
    const sortedVoteEntries = voteEntries.sort(([_, votesForA], [__, votesForB]) => votesForA.length < votesForB.length ? -1 : 1)
    return sortedVoteEntries;
  }
)

export const selectNonZeroOrderedVotesForPlayers = createSelector(
  selectOrderedVotesForPlayers,
  (voteEntries) => voteEntries.filter(([_, playerVotes]) => playerVotes.length > 0)
)