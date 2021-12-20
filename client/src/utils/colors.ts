import { TeamColor } from "../types/role.types";

interface Colors {
  primary: string;
  secondary: string;
}

export const getTeamColorHex = (teamColor: TeamColor): Colors => {
  switch (teamColor) {
    case TeamColor.BLUE:
      return { primary: "#0100E5", secondary: "#4D4DFE" };

    case TeamColor.GREY:
      return { primary: "#656363", secondary: "#868685" };

    case TeamColor.RED:
      return { primary: "#E50000", secondary: "#FE4D4D" };
  }
};
