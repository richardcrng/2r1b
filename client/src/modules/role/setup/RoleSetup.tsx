import { PlayerRole, RoleKey } from "../../../types/role.types";
import RoleSetupList from "./list/RoleSetupList";

interface Props {
  isEditable: boolean;
  onRoleIncrement?(roleKey: RoleKey, increment: number): void;
  rolesInSetup: [PlayerRole, number][];
}

function RoleSetup({
  isEditable,
  onRoleIncrement,
  rolesInSetup,
}: Props): JSX.Element {
  return (
    <>
      <RoleSetupList {...{ isEditable, onRoleIncrement, rolesInSetup }} />
    </>
  );
}

export default RoleSetup;
