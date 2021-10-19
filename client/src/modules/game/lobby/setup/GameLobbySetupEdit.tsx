import { Game } from "../../../../types/game.types";
import { ALL_ROLES, RoleKey } from "../../../../types/role.types";
import RoleCard from "../../../role/card/RoleCard";
import RoleDropdown from "../../../role/dropdown/RoleDropdown";

interface Props {
  game: Game;
}

function GameLobbySetupEdit({ game }: Props) {

  return (
    <>
      <p>Edit setup here!</p>
      <RoleDropdown />
    </>
  );
}

export default GameLobbySetupEdit