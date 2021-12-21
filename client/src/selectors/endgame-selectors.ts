import { createSelector } from "reselect";
import {
  selectBuriedRole,
  selectDescribeArmer,
  selectDescribeExplosivesHolder,
  selectDescribeOfficeHolder,
  selectDescribeTreater,
  selectExplosivesArmerRole,
  selectExplosivesHolder,
  selectExplosivesRole,
  selectFinalPlayerRooms,
  selectFindPlayerWithRole,
  selectGameEndgameState,
  selectIsRoleInPlay,
  selectIsRoleInSetup,
  selectOfficeHolder,
  selectOfficeHolderRole,
  selectOfficeHolderTreaterRole,
} from ".";
import { TeamResult } from "../types/game.types";
import { PlayerActionType } from "../types/player-action.types";
import { RoleKey, TeamColor } from "../types/role.types";

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

export const selectIsPrivateEyeIdentificationNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleInPlay, endgame) =>
    isRoleInPlay("PRIVATE_EYE_GREY") && !endgame.privateEyePrediction
);

export const selectIsPrivateEyeIdentificationCorrect = createSelector(
  selectGameEndgameState,
  selectBuriedRole,
  (endgame, buried) => endgame.privateEyePrediction === buried
);

export const selectIsGamblerPredictionNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleInPlay, endgame) =>
    isRoleInPlay("GAMBLER_GREY") && !endgame.gamblerPrediction
);

export const selectIsGamblerPredictionCorrect = createSelector(
  selectGameEndgameState,
  selectTeamWinCheckResult,
  (endgame, teamWin) => endgame.gamblerPrediction === teamWin.winningColor
);

export const selectIsSniperShotNeeded = createSelector(
  selectIsRoleInPlay,
  selectGameEndgameState,
  (isRoleInPlay, endgame) => isRoleInPlay("SNIPER_GREY") && !endgame.sniperShot
);

export const selectIsSniperShotOnDecoy = createSelector(
  selectGameEndgameState,
  selectFindPlayerWithRole,
  (endgame, findPlayerWithRole) =>
    endgame.sniperShot &&
    endgame.sniperShot === findPlayerWithRole("DECOY_GREY")?.socketId
);

export const selectIsSniperShotOnTarget = createSelector(
  selectGameEndgameState,
  selectFindPlayerWithRole,
  (endgame, findPlayerWithRole) =>
    endgame.sniperShot &&
    endgame.sniperShot === findPlayerWithRole("TARGET_GREY")?.socketId
);

export const selectIsGameEndgameComplete = createSelector(
  selectIsPrivateEyeIdentificationNeeded,
  selectIsGamblerPredictionNeeded,
  selectIsSniperShotNeeded,
  (
    isPrivateEyeIdentificationNeeded,
    isGamblerPredictionNeeded,
    isSniperShotNeeded
  ) =>
    [
      isPrivateEyeIdentificationNeeded,
      isGamblerPredictionNeeded,
      isSniperShotNeeded,
    ].some((bool) => bool)
);
