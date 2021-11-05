import { createSelector } from 'reselect';
import { Game, LeaderVote, Player, PlayerWithRoom, RolesCount, RoomName, RoundStatus } from "../types/game.types";
import { ALL_ROLES, PlayerRole, RoleKey } from '../types/role.types';
import { alertsFromSetup, SetupAlertSeverity, SetupAlertSource } from '../utils/setup-utils';
import { mapValues, last } from 'lodash';
import { PlayerActionType } from '../types/player-action.types';

export const selectGamePlayers = (game: Game) => game.players;
export const selectGameEndgameState = (game: Game) => game.endgame;
export const selectGameRolesInPlayCount = (game: Game): RolesCount => game.rolesCount;
export const selectGameRounds = (game: Game) => game.rounds
export const selectBuriedRole = (game: Game) => game.buriedRole;

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
  (rounds) => Object.values(rounds).find(round => [RoundStatus.ONGOING, RoundStatus.HOSTAGE_SELECTION].includes(round.status))
)

export const selectFinalGameRound = createSelector(
  selectGameRounds,
  (rounds) => last(Object.values(rounds))
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

export const selectCurrentRoundHostageTotal = createSelector(
  selectCurrentGameRound,
  (round) => round?.hostageCount
)

export const selectCurrentRoundRooms = createSelector(
  selectCurrentGameRound,
  (round) => round?.rooms
)

export const selectRoomsReadinessToExchange = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, room => room.isReadyToExchange)
)

export const selectIsHostageExchangeReady = createSelector(
  selectRoomsReadinessToExchange,
  (readiness) => Object.values(readiness).every(bool => bool)
);

export const selectCurrentRoundRoomHostages = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, room => room.hostages)
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

export const selectIsRoleInSetup = createSelector(
  selectGameRolesInPlayCount,
  (roles) => (roleKey: RoleKey): boolean => !!roles[roleKey]
)

export const selectIsRoleInPlay = createSelector(
  selectIsRoleInSetup,
  selectBuriedRole,
  (isRoleInPlay, buriedRole) => (role: RoleKey): boolean => isRoleInPlay(role) && buriedRole !== role
);

export const selectFindPlayerWithRole = createSelector(
  selectGamePlayers,
  (players) => (roleKey: RoleKey): Player | undefined => Object.values(players).find(player => player.role === roleKey)
)

export const selectPresident = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => findPlayerWithRole('PRESIDENT_BLUE')
)

export const selectBomber = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => findPlayerWithRole("BOMBER_RED")
);

export const selectEngineer = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => findPlayerWithRole("ENGINEER_RED")
);

export const selectDoctor = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => findPlayerWithRole("DOCTOR_BLUE")
);

export const selectExplosivesRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey => isRoleInPlay('BOMBER_RED') ? 'BOMBER_RED' : 'MARTYR_RED'
)

export const selectOfficeHolderRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey =>
    isRoleInPlay("PRESIDENT_BLUE") ? "PRESIDENT_BLUE" : "VICE_PRESIDENT_BLUE"
);

export const selectExplosivesHolder = createSelector(
  selectExplosivesRole,
  selectFindPlayerWithRole,
  (explosivesRole, findPlayerWithRole) => findPlayerWithRole(explosivesRole)
);

export const selectOfficeHolder = createSelector(
  selectOfficeHolderRole,
  selectFindPlayerWithRole,
  (officeHolderRole, findPlayerWithRole) => findPlayerWithRole(officeHolderRole)
)

export const selectIsGamblerInPlay = createSelector(
  selectIsRoleInPlay,
  (isRoleDealtOut) => isRoleDealtOut('GAMBLER_GREY')
)

export const selectIsGamblerPredictionNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleDealtOut, endgame) => isRoleDealtOut("GAMBLER_GREY") && !endgame.gamblerPrediction
)

export const selectDidRolesCardShare = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => (roleOne: RoleKey, roleTwo: RoleKey): boolean => {
    const didTwoCardShareWithOne = !!findPlayerWithRole(roleOne)?.conditions.shareRecords.find(record => record.offerAction.type === PlayerActionType.CARD_SHARE_OFFERED && record.sharedWithPlayer === roleTwo)
    const didOneCardShareWithTwo = !!findPlayerWithRole(
      roleTwo
    )?.conditions.shareRecords.find(
      (record) =>
        record.offerAction.type === PlayerActionType.CARD_SHARE_OFFERED &&
        record.sharedWithPlayer === roleOne
    );

    return didOneCardShareWithTwo && didTwoCardShareWithOne
  }
)

export const selectDidDoctorCardShareWithPresident = createSelector(
  selectDidRolesCardShare,
  (didRolesCardShare) => didRolesCardShare("DOCTOR_BLUE", "PRESIDENT_BLUE")
);

export const selectDidNurseCardShareWithPresident = createSelector(
  selectDidRolesCardShare,
  (didRolesCardShare) => didRolesCardShare("NURSE_BLUE", "PRESIDENT_BLUE")
);

export const selectDidEngineerCardShareWithBomber = createSelector(
  selectDidRolesCardShare,
  (didRolesCardShare) => didRolesCardShare('ENGINEER_RED', 'BOMBER_RED')
)

export const selectDidTinkererCardShareWithBomber = createSelector(
  selectDidRolesCardShare,
  (didRolesCardShare) => didRolesCardShare('TINKERER_RED', 'BOMBER_RED')
)

export const selectExplosivesArmerRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey =>
    isRoleInPlay("ENGINEER_RED") ? "ENGINEER_RED" : "TINKERER_RED"
);

export const selectOfficeHolderTreaterRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey =>
    isRoleInPlay("DOCTOR_BLUE") ? "DOCTOR_BLUE" : "NURSE_BLUE"
);

export const selectIsExplosiveArmedIfApplicable = createSelector(
  selectDidRolesCardShare,
  selectExplosivesRole,
  selectExplosivesArmerRole,
  selectIsRoleInPlay,
  (didShare, explosivesRole, explosivesArmerRole, isRoleInPlay) =>
    isRoleInPlay(explosivesArmerRole) ? didShare(explosivesArmerRole, explosivesRole) : true
);

export const selectIsOfficeHolderTreatedIfApplicable = createSelector(
  selectDidRolesCardShare,
  selectOfficeHolderRole,
  selectOfficeHolderTreaterRole,
  selectIsRoleInPlay,
  (didShare, officeHolderRole, treaterRole, isRoleInPlay) => isRoleInPlay(treaterRole)
    ? didShare(treaterRole, officeHolderRole)
    : true
);

export const selectIsExplosivesInSameFinalRoomAsOfficeHolder = createSelector(
  selectExplosivesHolder,
  selectOfficeHolder,
  selectFinalGameRound,
  (explosivesHolder, officeHolder, finalGameRound) => {
    const roomAllocation = finalGameRound!.playerAllocation;
    const explosivesRoom = roomAllocation[explosivesHolder!.socketId];
    const officeHolderRoom = roomAllocation[officeHolder!.socketId];
    return explosivesRoom === officeHolderRoom
  }
)

export const selectIsGameEndgameComplete = createSelector(
  selectIsGamblerPredictionNeeded,
  (isGamblerPredictionNeeded) => !isGamblerPredictionNeeded
)