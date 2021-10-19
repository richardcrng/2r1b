import { ALL_ROLES } from "../../../../types/role.types";
import RoleCard from "../../../role/card/RoleCard";


function GameLobbySetupEdit() {
  return (
    <>
      <p>Edit setup here!</p>
      <RoleCard role={ALL_ROLES.PRIVATE_EYE_GREY} />
    </>
  );
}

export default GameLobbySetupEdit