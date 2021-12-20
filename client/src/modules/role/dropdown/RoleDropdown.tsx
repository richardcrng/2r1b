import { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { ALPHABETISED_ROLE_VALUES, RoleKey } from "../../../types/role.types";
import { getTeamColorHex } from "../../../utils/colors";

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
    <span style={{ color: getTeamColorHex(roleValue.color).primary }}>
      {roleValue.roleName}
    </span>
  ),
}));

interface Props {
  filter?(role: typeof ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS[0]): boolean;
  onRoleSelect?(roleKey: RoleKey): void;
  selectedRole?: RoleKey;
}

function RoleDropdown({
  filter,
  onRoleSelect,
  selectedRole: controlledRoleValue,
}: Props): JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState<RoleKey>();
  const selectedRole = controlledRoleValue ?? uncontrolledValue;

  const optionsToList = filter
    ? ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS.filter(filter)
    : ALPHABETISED_ROLE_VALUE_DROPDOWN_OPTIONS;

  return (
    <Dropdown
      search
      selection
      fluid
      options={optionsToList}
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
