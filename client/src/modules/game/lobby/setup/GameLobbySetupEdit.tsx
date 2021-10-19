import { useState } from "react";
import { Button } from "semantic-ui-react";
import { selectRolesInSetup } from "../../../../selectors/game";
import { Game } from "../../../../types/game.types";
import { ALL_ROLES, RoleKey } from "../../../../types/role.types";
import RoleCard, { getColors } from "../../../role/card/RoleCard";
import RoleDropdown from "../../../role/dropdown/RoleDropdown";

interface Props {
  game: Game;
}

function GameLobbySetupEdit({ game }: Props) {
  
  const [selectedRole, setSelectedRole] = useState<RoleKey>()
  const rolesInSetup = selectRolesInSetup(game);

  return (
    <>
      <p>Edit setup here!</p>
      <ul>
        {rolesInSetup.map(([role, count]) => (
          <li key={role.key}>
            <span
              style={{ color: getColors(role.color).primary }}
            >
              {role.roleName}
            </span> x {count}
          </li>
        ))}
      </ul>
      <RoleDropdown
        selectedRole={selectedRole}
        onRoleSelect={(role) => setSelectedRole(role)}
      />
      <Button fluid primary disabled={!selectedRole}>
        Add role
      </Button>
    </>
  );
}

export default GameLobbySetupEdit