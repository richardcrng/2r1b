import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from 'styled-components'
import { selectGameRolesInPlayCount, selectRolesInSetup } from "../../../../selectors/game";
import { Game } from "../../../../types/game.types";
import { ALL_ROLES, RoleKey } from "../../../../types/role.types";
import RoleAdder from "../../../role/adder/RoleAdder";
import { getColors } from "../../../role/card/RoleCard";
import RoleDropdown from "../../../role/dropdown/RoleDropdown";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
`

interface Props {
  game: Game;
  onRoleIncrement(role: RoleKey, increment: number): void;
}

function GameLobbySetupEdit({ game, onRoleIncrement }: Props) {
  
  const [selectedRole, setSelectedRole] = useState<RoleKey>()
  const rolesCount = selectGameRolesInPlayCount(game);
  const rolesInSetup = selectRolesInSetup(game);

  return (
    <Container className="active-contents">
      <div>
        <p>Edit setup here!</p>
        <ul>
          {rolesInSetup.map(([role, count]) => (
            <li key={role.key}>
              <span style={{ color: getColors(role.color).primary }}>
                {role.roleName}
              </span>{" "}
              x {count}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <RoleAdder
          {...{ onRoleIncrement, rolesCount, selectedRole }}
          onRoleSelect={(role) => setSelectedRole(role)}
        />
        <Button fluid>Back</Button>
      </div>
    </Container>
  );
}

export default GameLobbySetupEdit