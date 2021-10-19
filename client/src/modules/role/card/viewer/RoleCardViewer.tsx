import { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { ALL_ROLES, RoleKey } from "../../../../types/role.types";
import RoleCard, { getColors } from "../RoleCard";

const roleValues = Object.values(ALL_ROLES);
const roleValuesAlphabetised = roleValues.sort((a, b) =>
  a.roleName < b.roleName ? -1 : 1
);

const roleValueDropdownOptions: {
  key: RoleKey;
  text: string;
  value: RoleKey;
  content: JSX.Element;
}[] = roleValuesAlphabetised.map((roleValue) => ({
  key: roleValue.key,
  text: roleValue.roleName,
  value: roleValue.key,
  content: (
    <span style={{ color: getColors(roleValue.color).primary }}>
      {roleValue.roleName}
    </span>
  ),
}));

interface Props {
  onRoleSelect?(roleKey: RoleKey): void;
  selectedRole?: RoleKey;
}

function RoleCardViewer({ onRoleSelect, selectedRole: controlledRoleValue }: Props) {

  const [uncontrolledValue, setUncontrolledValue] = useState<RoleKey>();
  const selectedRole = controlledRoleValue ?? uncontrolledValue;

  return (
    <>
      <p>Select a role to view</p>
      <Dropdown
        search
        selection
        fluid
        options={roleValueDropdownOptions}
        value={selectedRole}
        onChange={(_, { value }) => {
          const newRole = value as RoleKey
          onRoleSelect && onRoleSelect(newRole);
          setUncontrolledValue(newRole);
        }}
      />
      <br />
      {selectedRole && (
        <RoleCard role={ALL_ROLES[selectedRole]} />
      )}
    </>
  )
}

export default RoleCardViewer;