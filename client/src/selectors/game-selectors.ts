import { createSelector } from "reselect";
import {
  Game,
  LeaderVote,
  Player,
  PlayerResult,
  PlayerWithRoom,
  RolesCount,
  RoomName,
  RoundStatus,
  TeamResult,
} from "../types/game.types";
import { ALL_ROLES, PlayerRole, RoleKey, TeamColor } from "../types/role.types";
import {
  alertsFromSetup,
  SetupAlertSeverity,
  SetupAlertSource,
} from "../utils/setup-utils";
import { mapValues, last } from "lodash";
import { PlayerActionType } from "../types/player-action.types";
import { getRoleName } from "../utils/role-utils";

export const selectGame = (game: Game) => game;
export const selectGamePlayers = (game: Game) => game.players;
export const selectGameEndgameState = (game: Game) => game.endgame;
export const selectGameRolesInSetupCount = (game: Game): RolesCount =>
  game.rolesCount;
export const selectGameRounds = (game: Game) => game.rounds;
export const selectBuriedRole = (game: Game) => game.buriedRole;

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
  (rolesCount, nPlayers) => alertsFromSetup(rolesCount, nPlayers)
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
  (round) => round?.hostageCount
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

    for (let player of playerList) {
      const currVote = player.leaderVote;
      if (currVote) {
        votes[currVote.proposedLeaderId].push(currVote);
      }
    }

    for (let playerId in votes) {
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
    (roleKey: RoleKey): Player | undefined =>
      Object.values(players).find((player) => player.role === roleKey)
);

export const selectPresident = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) => findPlayerWithRole("PRESIDENT_BLUE")
);

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

export const selectDescribeOfficeHolder = createSelector(
  selectOfficeHolderRole,
  (officeHolderRole) =>
    officeHolderRole === "PRESIDENT_BLUE"
      ? getRoleName(officeHolderRole)
      : `${getRoleName(officeHolderRole)} (filling in for the President)`
);

export const selectDescribeExplosivesHolder = createSelector(
  selectExplosivesRole,
  (explosivesRole) =>
    explosivesRole === "BOMBER_RED"
      ? getRoleName(explosivesRole)
      : `${getRoleName(explosivesRole)} (filling in for the Bomber)`
);

export const selectDescribeTreater = createSelector(
  selectOfficeHolderTreaterRole,
  (treaterRole) =>
    treaterRole === "DOCTOR_BLUE"
      ? getRoleName(treaterRole)
      : `${getRoleName(treaterRole)} (filling in for the Doctor)`
);

export const selectDescribeArmer = createSelector(
  selectExplosivesArmerRole,
  (armerRole) =>
    armerRole === "ENGINEER_RED"
      ? getRoleName(armerRole)
      : `${getRoleName(armerRole)} (filling in for the Engineer)`
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
);

export const selectIsPrivateEyeIdentificationNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleInPlay, endgame) =>
    isRoleInPlay("PRIVATE_EYE_GREY") && !endgame.privateEyePrediction
);

export const selectIsGamblerPredictionNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleInPlay, endgame) =>
    isRoleInPlay("GAMBLER_GREY") && !endgame.gamblerPrediction
);

export const selectDidRolesCardShare = createSelector(
  selectFindPlayerWithRole,
  (findPlayerWithRole) =>
    (roleOne: RoleKey, roleTwo: RoleKey): boolean => {
      const didTwoCardShareWithOne = !!findPlayerWithRole(
        roleOne
      )?.conditions.shareRecords.find(
        (record) =>
          record.offerAction.type === PlayerActionType.CARD_SHARE_OFFERED &&
          record.sharedWithPlayer === roleTwo
      );
      const didOneCardShareWithTwo = !!findPlayerWithRole(
        roleTwo
      )?.conditions.shareRecords.find(
        (record) =>
          record.offerAction.type === PlayerActionType.CARD_SHARE_OFFERED &&
          record.sharedWithPlayer === roleOne
      );

      return didOneCardShareWithTwo && didTwoCardShareWithOne;
    }
);

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
  (didRolesCardShare) => didRolesCardShare("ENGINEER_RED", "BOMBER_RED")
);

export const selectDidTinkererCardShareWithBomber = createSelector(
  selectDidRolesCardShare,
  (didRolesCardShare) => didRolesCardShare("TINKERER_RED", "BOMBER_RED")
);

export const selectIsExplosiveArmedIfApplicable = createSelector(
  selectDidRolesCardShare,
  selectExplosivesRole,
  selectExplosivesArmerRole,
  selectIsRoleInPlay,
  (didShare, explosivesRole, explosivesArmerRole, isRoleInPlay) =>
    isRoleInPlay(explosivesArmerRole)
      ? didShare(explosivesArmerRole, explosivesRole)
      : true
);

export const selectIsOfficeHolderTreatedIfApplicable = createSelector(
  selectDidRolesCardShare,
  selectOfficeHolderRole,
  selectOfficeHolderTreaterRole,
  selectIsRoleInPlay,
  (didShare, officeHolderRole, treaterRole, isRoleInPlay) =>
    isRoleInPlay(treaterRole) ? didShare(treaterRole, officeHolderRole) : true
);

export const selectIsExplosivesInSameFinalRoomAsOfficeHolder = createSelector(
  selectExplosivesHolder,
  selectOfficeHolder,
  selectFinalPlayerRooms,
  (explosivesHolder, officeHolder, finalPlayerRooms) => {
    const explosivesRoom = finalPlayerRooms?.[explosivesHolder?.socketId ?? ""];
    const officeHolderRoom = finalPlayerRooms?.[officeHolder?.socketId ?? ""];
    return (
      typeof explosivesRoom !== "undefined" &&
      explosivesRoom === officeHolderRoom
    );
  }
);

export const selectTeamWinCheckResult = createSelector(
  selectIsOfficeHolderTreatedIfApplicable,
  selectIsExplosiveArmedIfApplicable,
  selectIsExplosivesInSameFinalRoomAsOfficeHolder,
  selectIsRoleInSetup,
  selectDescribeOfficeHolder,
  selectDescribeExplosivesHolder,
  selectDescribeTreater,
  selectDescribeArmer,
  (
    isTreated,
    isArmed,
    isSameRoom,
    isRoleInSetup,
    officeHolder,
    explosivesHolder,
    treater,
    armer
  ): TeamResult => {
    const isDoctorInvolved = isRoleInSetup("DOCTOR_BLUE");
    const isEngineerInvolved = isRoleInSetup("ENGINEER_RED");

    // DOCTOR AND ENGINEER DUAL CASE
    if (isDoctorInvolved && isEngineerInvolved) {
      if (isSameRoom) {
        if (isArmed) {
          return {
            winningColor: TeamColor.RED,
            reason: `The ${officeHolder} was killed in an explosion! They ended up in the same room as the ${explosivesHolder}, whose explosives were successfully armed by the ${armer}.`,
          };
        } else if (isTreated) {
          return {
            winningColor: TeamColor.BLUE,
            reason: `The ${officeHolder} survived! Their medical condition was treated by the ${treater}, and whilst they ended up in the same room as the ${explosivesHolder}, the explosives were not armed by the ${armer}.`,
          };
        } else {
          return {
            winningColor: "neither",
            reason: `The ${officeHolder} died... but peacefully! Their fatal medical condition was not treated by the ${treater}; and no explosion happened, since the ${explosivesHolder}'s explosives were not armed by the ${armer}.`,
          };
        }
      } else if (isTreated) {
        return {
          winningColor: TeamColor.BLUE,
          reason: `The ${officeHolder} survived! Their medical condition was treated by the ${treater}, and they were kept apart from the ${explosivesHolder}.`,
        };
      } else if (isArmed) {
        return {
          winningColor: TeamColor.RED,
          reason: `The ${officeHolder} died... and chaos errupted! Their fatal medical condition was not treated by the ${treater}, and the ${explosivesHolder}'s explosives were successfully armed by the ${armer}.`,
        };
      } else {
        return {
          winningColor: "neither",
          reason: `The ${officeHolder} died... but peacefully! Their fatal medical condition was not treated by the ${treater}; and no explosion happened, since the ${explosivesHolder}'s explosives were not armed by the ${armer}.`,
        };
      }
    }

    // DOCTOR CASE
    if (isDoctorInvolved /* && !isEngineerInvolved - implicit */) {
      if (isSameRoom) {
        return {
          winningColor: TeamColor.RED,
          reason: `The ${officeHolder} was killed in an explosion! They ended up in the same room as the ${explosivesHolder}.`,
        };
      } else if (!isTreated) {
        return {
          winningColor: TeamColor.RED,
          reason: `The ${officeHolder} died! Their fatal medical condition was not treated by the ${treater}.`,
        };
      } else {
        return {
          winningColor: TeamColor.BLUE,
          reason: `The ${officeHolder} survived! Their medical condition was successfully treated by the ${treater}, and they were kept apart from the ${explosivesHolder}.`,
        };
      }
    }

    // ENGINEER CASE
    if (isEngineerInvolved /* && !isDoctorInvolved - implicit */) {
      if (isSameRoom && isArmed) {
        return {
          winningColor: TeamColor.RED,
          reason: `The ${officeHolder} was killed in an explosion! They ended up in the same room as the ${explosivesHolder}, whose explosives were successfully armed by the ${armer}.`,
        };
      } else if (isSameRoom) {
        return {
          winningColor: TeamColor.BLUE,
          reason: `The ${officeHolder} survived! Although they ended up in the same room as the ${explosivesHolder}, the explosives had not been armed by the ${armer}.`,
        };
      } else {
        return {
          winningColor: TeamColor.BLUE,
          reason: `The ${officeHolder} survived! They were kept apart from the ${explosivesHolder}, whose explosives ${
            isArmed
              ? `had been successfully armed by the ${armer}`
              : `had not been armed by the ${armer} in any case`
          }.`,
        };
      }
    }

    // VANILLA CASE
    if (isSameRoom) {
      return {
        winningColor: TeamColor.RED,
        reason: `The ${officeHolder} was killed in an explosion! They ended up in the same room as the ${explosivesHolder}.`,
      };
    } else {
      return {
        winningColor: TeamColor.BLUE,
        reason: `The ${officeHolder} was survived! They were kept apart from the ${explosivesHolder}.`,
      };
    }
  }
);

export const selectIsPrivateEyeIdentificationCorrect = createSelector(
  selectGameEndgameState,
  selectBuriedRole,
  (endgame, buried) => endgame.privateEyePrediction === buried
);

export const selectIsGamblerPredictionCorrect = createSelector(
  selectGameEndgameState,
  selectTeamWinCheckResult,
  (endgame, teamWin) => endgame.gamblerPrediction === teamWin.winningColor
);

export const selectGreyPlayerResults = createSelector(
  selectGame,
  selectIsRoleInPlay,
  selectGameEndgameState,
  selectIsPrivateEyeIdentificationCorrect,
  selectIsGamblerPredictionCorrect,
  selectFindPlayerWithRole,
  selectOfficeHolder,
  selectDescribeOfficeHolder,
  selectExplosivesHolder,
  selectDescribeExplosivesHolder,
  (
    game,
    isRoleInPlay,
    endgame,
    isPrivateEyeWin,
    isGamblerWin,
    findPlayerWithRole,
    officerHolder,
    describeOfficeHolder,
    explosivesHolder,
    describeExplosivesHolder
  ): PlayerResult[] => {
    const results: PlayerResult[] = [];

    if (isRoleInPlay("PRIVATE_EYE_GREY")) {
      const prediction = endgame.privateEyePrediction
        ? getRoleName(endgame.privateEyePrediction)
        : undefined;
      const actual = game.buriedRole ? getRoleName(game.buriedRole) : undefined;
      results.push({
        role: "PRIVATE_EYE_GREY",
        isWin: isPrivateEyeWin,
        reason: `${
          isPrivateEyeWin
            ? `Correct prediction of ${prediction} as the buried role`
            : `Incorrect prediction of ${prediction} as the buried role (it was ${actual})`
        }.`,
      });
    }

    if (isRoleInPlay("GAMBLER_GREY")) {
      const prediction = endgame.gamblerPrediction;
      results.push({
        role: "GAMBLER_GREY",
        isWin: isGamblerWin,
        reason: `${
          isGamblerWin
            ? `Correct prediction that ${prediction} team would win`
            : `Incorrect prediction that ${prediction} team would win`
        }.`,
      });
    }

    if (isRoleInPlay("INTERN_GREY")) {
      const intern = findPlayerWithRole("INTERN_GREY")!;
      const isInternWin =
        game.endgame.finalRooms![intern.socketId] ===
        game.endgame.finalRooms![officerHolder!.socketId];
      results.push({
        role: "INTERN_GREY",
        isWin: isInternWin,
        reason: `Ended in ${
          isInternWin ? "the same" : "a different"
        } room to the ${describeOfficeHolder}`,
      });
    }

    if (isRoleInPlay("VICTIM_GREY")) {
      const victim = findPlayerWithRole("VICTIM_GREY")!;
      const isVictimWin =
        game.endgame.finalRooms![victim.socketId] ===
        game.endgame.finalRooms![explosivesHolder!.socketId];
      results.push({
        role: "INTERN_GREY",
        isWin: isVictimWin,
        reason: `Ended in ${
          isVictimWin ? "the same" : "a different"
        } room to the ${describeExplosivesHolder}`,
      });
    }

    return results;
  }
);

export const selectIsGameEndgameComplete = createSelector(
  selectIsPrivateEyeIdentificationNeeded,
  selectIsGamblerPredictionNeeded,
  (isPrivateEyeIdentificationNeeded, isGamblerPredictionNeeded) =>
    [isPrivateEyeIdentificationNeeded, isGamblerPredictionNeeded].some(
      (bool) => bool
    )
);
