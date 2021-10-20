import styled from 'styled-components'
import { PlayerRole, RoleKey } from '../../../types/role.types';
import RoleSetupList from './list/RoleSetupList';
import { selectTotalCountOfGameRoles } from '../../../selectors/game';


interface Props {
  isEditable: boolean;
  onRoleIncrement?(roleKey: RoleKey, increment: number): void;
  rolesInSetup: [PlayerRole, number][];
}

function RoleSetup({ isEditable, onRoleIncrement, rolesInSetup }: Props) {

  const rolesCount = rolesInSetup.reduce((acc, curr) => acc + curr[1], 0)

  return (
    <>
      <p>This setup supports {rolesCount} players, or {rolesCount - 1} players if you Bury a card.</p>
      <RoleSetupList {...{ isEditable, onRoleIncrement, rolesInSetup }} />
    </>
  );
}

export default RoleSetup;