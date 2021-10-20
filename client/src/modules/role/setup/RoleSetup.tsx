import styled from 'styled-components'
import { PlayerRole, RoleKey } from '../../../types/role.types';
import { getRoleRestrictions } from '../../../utils/role-utils';
import { getColors } from '../card/RoleCard';

const RoleUl = styled.ul`
  padding-inline-start: 0;
`;

const RoleLi = styled.li`
  display: flex;
  justify-content: space-between;
  min-height: 22px;
`;

interface Props {
  onRoleIncrement?(roleKey: RoleKey, increment: number): void;
  rolesInSetup: [PlayerRole, number][];
}

function RoleSetup({ onRoleIncrement, rolesInSetup }: Props) {
  return (
    <RoleUl>
      {rolesInSetup.map(([role, count]) => {
        const { roleMin, roleMax } = getRoleRestrictions(role.key);

        const handleIncrement = onRoleIncrement
          ? () => onRoleIncrement(role.key, 1)
          : undefined

        const handleDecrement = onRoleIncrement
          ? () => onRoleIncrement(role.key, -1)
          : undefined;
    
        return (
          <RoleLi key={role.key}>
            <div>
              <span style={{ color: getColors(role.color).primary }}>
                {role.roleName}
              </span>{" "}
              x {count}
            </div>
            {roleMin !== roleMax && onRoleIncrement && (
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

export default RoleSetup;