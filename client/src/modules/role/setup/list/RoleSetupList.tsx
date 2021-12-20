import styled from "styled-components";
import { PlayerRole, RoleKey, RoleRanking } from "../../../../types/role.types";
import { getTeamColorHex } from "../../../../utils/colors";
import {
  getRoleRanking,
  getRoleRestrictions,
} from "../../../../utils/role-utils";

const RoleUl = styled.ul`
  padding-inline-start: 0;
`;

const RoleLi = styled.li`
  display: flex;
  justify-content: space-between;
  min-height: 22px;
`;

interface Props {
  isEditable: boolean;
  onRoleIncrement?(roleKey: RoleKey, increment: number): void;
  rolesInSetup: [PlayerRole, number][];
}

function RoleSetupList({
  isEditable,
  onRoleIncrement,
  rolesInSetup,
}: Props): JSX.Element {
  return (
    <RoleUl>
      {rolesInSetup.map(([role, count]) => {
        const { roleMin, roleMax } = getRoleRestrictions(role.key);

        const handleIncrement = onRoleIncrement
          ? () => onRoleIncrement(role.key, 1)
          : undefined;

        const handleDecrement = onRoleIncrement
          ? () => onRoleIncrement(role.key, -1)
          : undefined;

        return (
          <RoleLi key={role.key}>
            <div>
              <span
                style={{
                  color: getTeamColorHex(role.color).primary,
                  fontWeight:
                    getRoleRanking(role.key) === RoleRanking.PRIMARY
                      ? "bold"
                      : undefined,
                }}
              >
                {role.roleName}
              </span>{" "}
              x {count}
            </div>
            {isEditable && roleMin !== roleMax && (
              <div>
                {roleMax > 1 && (
                  <button disabled={count >= roleMax} onClick={handleIncrement}>
                    +
                  </button>
                )}
                {roleMin === 0 && (
                  <button disabled={count <= roleMin} onClick={handleDecrement}>
                    -
                  </button>
                )}
              </div>
            )}
          </RoleLi>
        );
      })}
    </RoleUl>
  );
}

export default RoleSetupList;
