import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from 'styled-components'
import { selectGameRolesInPlayCount, selectRolesInSetupAlphabetised } from "../../../../selectors/game";
import { Game } from "../../../../types/game.types";
import { RoleKey } from "../../../../types/role.types";
import { getRoleRestrictions } from "../../../../utils/role-utils";
import RoleAdder from "../../../role/adder/RoleAdder";
import { getColors } from "../../../role/card/RoleCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
`
const RoleUl = styled.ul`
  padding-inline-start: 0;
`

const RoleLi = styled.li`
  display: flex;
  justify-content: space-between;
  min-height: 22px;
`

interface Props {
  game: Game;
  onRoleIncrement(role: RoleKey, increment: number): void;
}

function GameLobbySetupEdit({ game, onRoleIncrement }: Props) {
  
  const [selectedRole, setSelectedRole] = useState<RoleKey>()
  const rolesCount = selectGameRolesInPlayCount(game);
  const rolesInSetup = selectRolesInSetupAlphabetised(game);

  return (
    <Container className="active-contents">
      <div>
        <p>Edit setup here!</p>
        <RoleUl>
          {rolesInSetup.map(([role, count]) => {
            const { roleMin, roleMax } = getRoleRestrictions(role.key);
            const handleIncrement = () => onRoleIncrement(role.key, 1);
            const handleDecrement = () => onRoleIncrement(role.key, -1);

            return (
              <RoleLi key={role.key}>
                <div>
                  <span style={{ color: getColors(role.color).primary }}>
                    {role.roleName}
                  </span>{" "}
                  x {count}
                </div>
                {roleMin !== roleMax && (
                  <div>
                    {roleMax > 1 && (
                      <button disabled={count >= roleMax} onClick={handleIncrement}>+</button>
                    )}
                    {roleMin === 0 && (
                      <button disabled={count <= roleMin} onClick={handleDecrement}>-</button>
                    )}
                  </div>
                )}
              </RoleLi>
            );
          })}
        </RoleUl>
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