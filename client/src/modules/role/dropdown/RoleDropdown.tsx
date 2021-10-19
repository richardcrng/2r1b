import { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { ALPHABETISED_ROLE_VALUES, RoleKey } from "../../../types/role.types";
import { getColors } from "../card/RoleCard";

const ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS: {
  key: RoleKey;
  text: string;
  value: RoleKey;
  content: JSX.Element;
}[] = ALPHABETISED_ROLE_VALUES.map((roleValue) => ({
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

function RoleDropdown({ onRoleSelect, selectedRole: controlledRoleValue }: Props) {
  const [uncontrolledValue, setUncontrolledValue] = useState<RoleKey>();
  const selectedRole = controlledRoleValue ?? uncontrolledValue;

  return (
    <Dropdown
      search
      selection
      fluid
      export
      options={ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS}
      value={selectedRole}
      onChange={(_, { value }) => {
        const newRole = value as RoleKey;
        onRoleSelect && onRoleSelect(newRole);
        setUncontrolledValue(newRole);
      }}
    />
  );
}

export default RoleDropdown;