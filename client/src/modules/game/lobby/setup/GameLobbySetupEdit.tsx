import { Game } from "../../../../types/game.types";
import { ALL_ROLES } from "../../../../types/role.types";
import RoleCard from "../../../role/card/RoleCard";

interface Props {
  game: Game;
}

function GameLobbySetupEdit({ game }: Props) {
  return (
    <>
      <p>Edit setup here!</p>
      <RoleCard role={ALL_ROLES.PRIVATE_EYE_GREY} />
    </>
  );
}

export default GameLobbySetupEdit