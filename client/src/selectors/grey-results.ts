import { createSelector } from "reselect";
import {
  Player,
  PlayerResult,
  PlayerRoomAllocation,
} from "../types/game.types";
import { RoleKey } from "../types/role.types";
import { getRoleName } from "../utils/role-utils";
import SELECTORS from "./selectors";

export const selectGreyPlayerResults = createSelector(
  SELECTORS.selectGame,
  SELECTORS.selectIsRoleInPlay,
  SELECTORS.selectGameEndgameState,
  SELECTORS.selectIsPrivateEyeIdentificationCorrect,
  SELECTORS.selectIsGamblerPredictionCorrect,
  SELECTORS.selectFindPlayerWithRole,
  SELECTORS.selectOfficeHolder,
  SELECTORS.selectDescribeOfficeHolder,
  SELECTORS.selectExplosivesHolder,
  SELECTORS.selectDescribeExplosivesHolder,
  SELECTORS.selectDidRolesCardShare,
  (
    game,
    isRoleInPlay,
    endgame,
    isPrivateEyeWin,
    isGamblerWin,
    findPlayerWithRole,
    officeHolder,
    describeOfficeHolder,
    explosivesHolder,
    describeExplosivesHolder,
    didRolesCardShare
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

    if (isRoleInPlay("MI6_GREY") && officeHolder && explosivesHolder) {
      const didShareWithOfficeHolder = didRolesCardShare(
        "MI6_GREY",
        officeHolder.role
      );
      const didShareWithExplosivesHolder = didRolesCardShare(
        "MI6_GREY",
        explosivesHolder.role
      );
      const isMI6win = didShareWithOfficeHolder && didShareWithExplosivesHolder;
      results.push({
        role: "MI6_GREY",
        isWin: isMI6win,
        reason: `${
          isMI6win
            ? `Card shared with both ${describeOfficeHolder} and ${describeExplosivesHolder}`
            : didShareWithOfficeHolder
            ? `Card shared with ${describeOfficeHolder} but not ${describeExplosivesHolder}`
            : didShareWithExplosivesHolder
            ? `Card shared with ${describeExplosivesHolder} but not ${describeOfficeHolder}`
            : `Card shared with neither ${describeOfficeHolder} nor ${describeExplosivesHolder}`
        }`,
      });
    }

    if (game.endgame.finalRooms && officeHolder && explosivesHolder) {
      results.push(
        ...greyResultsFromFinalRooms(
          game.endgame.finalRooms,
          findPlayerWithRole,
          { player: officeHolder, description: describeOfficeHolder },
          { player: explosivesHolder, description: describeExplosivesHolder }
        )
      );
    }

    return results;
  }
);

const greyResultsFromFinalRooms = (
  finalRoomAllocation: PlayerRoomAllocation,
  findPlayerWithRole: (roleKey: RoleKey) => Player | undefined,
  officeHolder: { player: Player; description: string },
  explosivesHolder: { player: Player; description: string }
): PlayerResult[] => {
  const results: PlayerResult[] = [];

  const intern = findPlayerWithRole("INTERN_GREY");
  if (intern) {
    const isInternWin =
      finalRoomAllocation[intern.socketId] ===
      finalRoomAllocation[officeHolder.player.socketId];
    results.push({
      role: "INTERN_GREY",
      isWin: isInternWin,
      reason: `Ended in ${
        isInternWin ? "the same" : "a different"
      } room as the ${officeHolder.description}`,
    });
  }

  const victim = findPlayerWithRole("VICTIM_GREY");
  if (victim) {
    const isVictimWin =
      finalRoomAllocation[victim.socketId] ===
      finalRoomAllocation[explosivesHolder.player.socketId];
    results.push({
      role: "VICTIM_GREY",
      isWin: isVictimWin,
      reason: `Ended in ${
        isVictimWin ? "the same" : "a different"
      } room as the ${explosivesHolder.description}`,
    });
  }

  const rival = findPlayerWithRole("RIVAL_GREY");
  if (rival) {
    const isRivalWin =
      finalRoomAllocation[rival.socketId] !==
      finalRoomAllocation[officeHolder.player.socketId];
    results.push({
      role: "RIVAL_GREY",
      isWin: isRivalWin,
      reason: `Ended in ${
        isRivalWin ? "a different" : "the same"
      } room as the ${officeHolder.description}`,
    });
  }

  const survivor = findPlayerWithRole("SURVIVOR_GREY");
  if (survivor) {
    const isSurvivorWin =
      finalRoomAllocation[survivor.socketId] !==
      finalRoomAllocation[explosivesHolder.player.socketId];
    results.push({
      role: "SURVIVOR_GREY",
      isWin: isSurvivorWin,
      reason: `Ended in ${
        isSurvivorWin ? " a different" : "the same"
      } room as the ${explosivesHolder.description}`,
    });
  }

  return results;
};
