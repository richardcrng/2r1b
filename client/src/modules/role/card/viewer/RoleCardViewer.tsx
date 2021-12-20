import {
  ALL_ROLES,
  ALPHABETISED_ROLE_VALUES,
  RoleKey,
} from "../../../../types/role.types";
import { getTeamColorHex } from "../../../../utils/colors";
import RoleDropdown from "../../dropdown/RoleDropdown";
import RoleCard from "../RoleCard";

export const ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS: {
  key: RoleKey;
  text: string;
  value: RoleKey;
  content: JSX.Element;
}[] = ALPHABETISED_ROLE_VALUES.map((roleValue) => ({
  key: roleValue.key,
  text: roleValue.roleName,
  value: roleValue.key,
  content: (
    <span style={{ color: getTeamColorHex(roleValue.color).primary }}>
      {roleValue.roleName}
    </span>
  ),
}));

interface Props {
  onRoleSelect?(roleKey: RoleKey): void;
  selectedRole?: RoleKey;
}

function RoleCardViewer({ onRoleSelect, selectedRole }: Props): JSX.Element {
  return (
    <>
      <p>Select a role to view</p>
      <RoleDropdown {...{ onRoleSelect, selectedRole }} />
      <br />
      {selectedRole && <RoleCard role={ALL_ROLES[selectedRole]} />}
    </>
  );
}

export default RoleCardViewer;
