import { createSelector } from "reselect";
import {
  Game,
  GameEndgame,
  GameSettings,
  LeaderVote,
  Player,
  PlayerWithRoom,
  RolesCount,
  RoomName,
  Round,
  RoundStatus,
} from "../types/game.types";
import { ALL_ROLES, PlayerRole, RoleKey, TeamColor } from "../types/role.types";
import {
  alertsFromSetup,
  SetupAlertSeverity,
  SetupAlertSource,
} from "../utils/setup-utils";
import { mapValues, last } from "lodash";
import { getRoleName } from "../utils/role-utils";

export const selectGame = (game: Game): Game => game;
export const selectGamePlayers = (game: Game): Game["players"] => game.players;
export const selectGameEndgameState = (game: Game): GameEndgame => game.endgame;
export const selectGameRolesInSetupCount = (game: Game): RolesCount =>
  game.rolesCount;
export const selectGameRounds = (game: Game): Record<number, Round> =>
  game.rounds;
export const selectBuriedRole = (game: Game): RoleKey | undefined =>
  game.buriedRole;
export const selectGameSettings = (game: Game): GameSettings => game.settings;

export const selectTotalCountOfGameRoles = createSelector(
  selectGameRolesInSetupCount,
  (rolesCount) => Object.values(rolesCount).reduce((acc, val) => acc + val, 0)
);

export const selectGamePlayerIds = createSelector(
  selectGamePlayers,
  (players) => Object.keys(players)
);

export const selectGamePlayersList = createSelector(
  selectGamePlayers,
  (players) => Object.values(players)
);

export const selectGamePlayerCount = createSelector(
  selectGamePlayersList,
  (list) => list.length
);

export const selectGameSetupAlerts = createSelector(
  selectGameRolesInSetupCount,
  selectGamePlayerCount,
  selectGameSettings,
  (rolesCount, nPlayers, settings) =>
    alertsFromSetup(rolesCount, nPlayers, settings)
);

export const selectGameSetupAlertsFromPlayerCount = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ source }) => source === SetupAlertSource.PLAYER_COUNT)
);

export const selectGameSetupAlertsFromRoleSetup = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ source }) => source === SetupAlertSource.ROLE_SETUP)
);

export const selectGameSetupErrors = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ severity }) => severity === SetupAlertSeverity.ERROR)
);

export const selectGameSetupWarnings = createSelector(
  selectGameSetupAlerts,
  (alerts) =>
    alerts.filter(({ severity }) => severity === SetupAlertSeverity.WARNING)
);

export const selectGameSetupErrorsAndWarnings = createSelector(
  selectGameSetupErrors,
  selectGameSetupWarnings,
  (errors, warnings) => ({ errors, warnings })
);

export interface GameLobbyReadiness {
  isReady: boolean;
  reason?: string;
}

export const selectGameLobbyReadiness = createSelector(
  selectGamePlayerCount,
  (count) =>
    count >= 6
      ? { isReady: true }
      : { isReady: false, reason: "Minimum 6 players needed" }
);

export const selectRoleKeyEntriesInSetup = createSelector(
  selectGameRolesInSetupCount,
  (rolesCount) => Object.entries(rolesCount) as [RoleKey, number][]
);

export const selectRoleKeyEntriesInSetupInSetup = createSelector(
  selectRoleKeyEntriesInSetup,
  (entries) => entries.filter(([_, count]) => count > 0)
);

export const selectRolesInSetup = createSelector(
  selectRoleKeyEntriesInSetupInSetup,
  (entries) =>
    entries.map(([roleKey, roleCount]) => [ALL_ROLES[roleKey], roleCount]) as [
      PlayerRole,
      number
    ][]
);

export const selectNumberOfRolesInSetup = createSelector(
  selectRoleKeyEntriesInSetup,
  (roleKeyEntries) => roleKeyEntries.reduce((acc, [_, count]) => acc + count, 0)
);

export const selectRolesInSetupAlphabetised = createSelector(
  selectRolesInSetup,
  (roleEntries) =>
    [...roleEntries].sort((a, b) => (a[0].roleName < b[0].roleName ? -1 : 0))
);

export const selectRoleEntriesInPlay = createSelector(
  selectRolesInSetup,
  selectBuriedRole,
  (roleEntries, buriedRole) =>
    roleEntries
      .map(([role, count]): [PlayerRole, number] =>
        buriedRole === role.key ? [role, count - 1] : [role, count]
      )
      .filter(([_, count]) => count !== 0)
);

export const selectIsGreyRoleInPlay = createSelector(
  selectRoleEntriesInPlay,
  (entries) => entries.some(([role]) => role.color === TeamColor.GREY)
);

export const selectCurrentGameRound = createSelector(
  selectGameRounds,
  (rounds) =>
    Object.values(rounds).find((round) =>
      [RoundStatus.ONGOING, RoundStatus.HOSTAGE_SELECTION].includes(
        round.status
      )
    )
);

export const selectFinalPlayerRooms = createSelector(
  selectGameEndgameState,
  (endgame) => endgame.finalRooms
);

export const selectCurrentGameRoomAllocation = createSelector(
  selectCurrentGameRound,
  (round) => round?.playerAllocation
);

export const selectGamePlayersWithRooms = createSelector(
  selectGamePlayers,
  selectCurrentGameRoomAllocation,
  (players, roomAllocation = {}): Record<string, PlayerWithRoom> =>
    mapValues(players, (player) => ({
      ...player,
      room: roomAllocation[player.socketId] as RoomName | undefined,
    }))
);

export const selectPlayerIdsInEachRoom = createSelector(
  selectGamePlayersWithRooms,
  (players): Record<RoomName, string[]> =>
    Object.values(players).reduce(
      (acc, curr) => {
        if (curr.room) {
          return {
            ...acc,
            [curr.room]: [...acc[curr.room], curr.socketId],
          };
        } else {
          return acc;
        }
      },
      { [RoomName.A]: [], [RoomName.B]: [] }
    )
);

export const selectCurrentRoundHostageTotal = createSelector(
  selectCurrentGameRound,
  (round) => round?.hostageCount ?? 1
);

export const selectCurrentRoundRooms = createSelector(
  selectCurrentGameRound,
  (round) => round?.rooms
);

export const selectRoomsReadinessToExchange = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, (room) => room.isReadyToExchange)
);

export const selectIsHostageExchangeReady = createSelector(
  selectRoomsReadinessToExchange,
  (readiness) => Object.values(readiness).every((bool) => bool)
);

export const selectCurrentRoundRoomHostages = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, (room) => room.hostages)
);

export const selectCurrentRoomLeaderRecords = createSelector(
  selectCurrentRoundRooms,
  (rooms) => mapValues(rooms, (room) => room.leadersRecord)
);

export const selectCurrentRoomCurrentLeaderRecord = createSelector(
  selectCurrentRoomLeaderRecords,
  (leaderRecordsDict) =>
    mapValues(leaderRecordsDict, (leaderRecords) => last(leaderRecords))
);

export const selectCurrentRoomCurrentLeaders = createSelector(
  selectCurrentRoomCurrentLeaderRecord,
  (leaderRecordDict) =>
    mapValues(leaderRecordDict, (leaderRecord) => leaderRecord?.leaderId)
);

export const selectDictionaryOfVotesForPlayers = createSelector(
  selectGamePlayersList,
  (playerList): Record<string, LeaderVote[]> => {
    const votes: Record<string, LeaderVote[]> = Object.fromEntries(
      playerList.map((player) => [player.socketId, []])
    );

    for (const player of playerList) {
      const currVote = player.leaderVote;
      if (currVote) {
        votes[currVote.proposedLeaderId].push(currVote);
      }
    }

    for (const playerId in votes) {
      votes[playerId].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    }

    return votes;
  }
);

export const selectOrderedVotesForPlayers = createSelector(
  selectDictionaryOfVotesForPlayers,
  (voteDictionary) => {
    const voteEntries = Object.entries(voteDictionary);
    const sortedVoteEntries = voteEntries.sort(
      ([_, votesForA], [__, votesForB]) =>
        votesForA.length < votesForB.length ? -1 : 1
    );
    return sortedVoteEntries;
  }
);

export const selectNonZeroOrderedVotesForPlayers = createSelector(
  selectOrderedVotesForPlayers,
  (voteEntries) =>
    voteEntries.filter(([_, playerVotes]) => playerVotes.length > 0)
);

export const selectIsRoleInSetup = createSelector(
  selectGameRolesInSetupCount,
  (roles) =>
    (roleKey: RoleKey): boolean =>
      !!roles[roleKey]
);

export const selectIsRoleInPlay = createSelector(
  selectIsRoleInSetup,
  selectBuriedRole,
  (isRoleInPlay, buriedRole) =>
    (role: RoleKey): boolean =>
      isRoleInPlay(role) && buriedRole !== role
);

export const selectFindPlayerWithRole = createSelector(
  selectGamePlayers,
  (players) =>
    (roleKey: RoleKey): (Player & { role: RoleKey }) | undefined =>
      // type assertion okay since roleKey is defined here
      //  so the player found must have a role
      Object.values(players).find(
        (player) => player.role === roleKey
      ) as Player & { role: RoleKey }
);

export const selectExplosivesRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey =>
    isRoleInPlay("BOMBER_RED") ? "BOMBER_RED" : "MARTYR_RED"
);

export const selectOfficeHolderRole = createSelector(
  selectIsRoleInPlay,
  (isRoleInPlay): RoleKey =>
    isRoleInPlay("PRESIDENT_BLUE") ? "PRESIDENT_BLUE" : "VICE_PRESIDENT_BLUE"
);

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

interface SelectedRoleDescription {
  role: RoleKey;
  description: string;
}

export const selectDescribeOfficeHolder = createSelector(
  selectOfficeHolderRole,
  (officeHolderRole): SelectedRoleDescription => ({
    role: officeHolderRole,
    description:
      officeHolderRole === "PRESIDENT_BLUE"
        ? getRoleName(officeHolderRole)
        : `${getRoleName(officeHolderRole)} (filling in for the President)`,
  })
);

export const selectDescribeExplosivesHolder = createSelector(
  selectExplosivesRole,
  (explosivesRole): SelectedRoleDescription => ({
    role: explosivesRole,
    description:
      explosivesRole === "BOMBER_RED"
        ? getRoleName(explosivesRole)
        : `${getRoleName(explosivesRole)} (filling in for the Bomber)`,
  })
);

export const selectDescribeTreater = createSelector(
  selectOfficeHolderTreaterRole,
  (treaterRole): SelectedRoleDescription => ({
    role: treaterRole,
    description:
      treaterRole === "DOCTOR_BLUE"
        ? getRoleName(treaterRole)
        : `${getRoleName(treaterRole)} (filling in for the Doctor)`,
  })
);

export const selectDescribeArmer = createSelector(
  selectExplosivesArmerRole,
  (armerRole) => ({
    role: armerRole,
    description:
      armerRole === "ENGINEER_RED"
        ? getRoleName(armerRole)
        : `${getRoleName(armerRole)} (filling in for the Engineer)`,
  })
);

type SelectedPlayerWithDescription = Player & SelectedRoleDescription;

export const selectOfficeHolder = createSelector(
  selectOfficeHolderRole,
  selectFindPlayerWithRole,
  selectDescribeOfficeHolder,
  (
    officeHolderRole,
    findPlayerWithRole,
    describeOfficeHolder
  ): SelectedPlayerWithDescription => {
    const officeHolder = findPlayerWithRole(officeHolderRole);
    if (!officeHolder) throw new Error("Couldn't find office holding player");
    return {
      ...officeHolder,
      ...describeOfficeHolder,
    };
  }
);

export const selectExplosivesHolder = createSelector(
  selectExplosivesRole,
  selectFindPlayerWithRole,
  selectDescribeExplosivesHolder,
  (
    explosivesRole,
    findPlayerWithRole,
    describeExplosivesHolder
  ): SelectedPlayerWithDescription => {
    const explosivesHolder = findPlayerWithRole(explosivesRole);
    if (!explosivesHolder)
      throw new Error("Couldn't find office holding player");
    return {
      ...explosivesHolder,
      ...describeExplosivesHolder,
    };
  }
);
