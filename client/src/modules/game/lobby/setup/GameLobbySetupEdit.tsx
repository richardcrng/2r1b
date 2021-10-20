import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from 'styled-components'
import { selectGameRolesInPlayCount, selectRolesInSetup } from "../../../../selectors/game";
import { Game } from "../../../../types/game.types";
import { ALL_ROLES, RoleKey } from "../../../../types/role.types";
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

  const handleIncrement = () => {
    const roleToIncrement = selectedRole!
    const currentCount = rolesCount[roleToIncrement];
    const maxCount = ALL_ROLES[roleToIncrement].restrictions.roleMax;
    if (currentCount < maxCount) {
      onRoleIncrement(selectedRole!, 1);
      if (currentCount + 1 === maxCount) {
        setSelectedRole(undefined)
      }
    } else {
      window.alert(`Already at max count for ${roleToIncrement}`)
    }
  }

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
        <RoleDropdown
          filter={(role) => {
            const currentCount = rolesCount[role.key];
            return currentCount < ALL_ROLES[role.key].restrictions.roleMax
          }}
          selectedRole={selectedRole}
          onRoleSelect={(role) => setSelectedRole(role)}
        />
        <Button
          fluid
          primary
          disabled={!selectedRole}
          onClick={handleIncrement}
        >
          Add role
        </Button>
        <Button fluid>Back</Button>
      </div>
    </Container>
  );
}

export default GameLobbySetupEdit