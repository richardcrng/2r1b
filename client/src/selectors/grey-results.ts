import { createSelector } from "reselect";
import {
  selectDescribeExplosivesHolder,
  selectDescribeOfficeHolder,
  selectExplosivesHolder,
  selectFindPlayerWithRole,
  selectGame,
  selectGameEndgameState,
  selectIsGamblerPredictionCorrect,
  selectIsPrivateEyeIdentificationCorrect,
  selectIsRoleInPlay,
  selectOfficeHolder,
} from ".";
import { PlayerResult } from "../types/game.types";
import { getRoleName } from "../utils/role-utils";

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
        role: "VICTIM_GREY",
        isWin: isVictimWin,
        reason: `Ended in ${
          isVictimWin ? "the same" : "a different"
        } room to the ${describeExplosivesHolder}`,
      });
    }

    return results;
  }
);
