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

function RoleCardViewer() {
  const [roleKey, setRoleKey] = useState<RoleKey>('PRESIDENT_BLUE')

  return (
    <>
      <p>Select a role to view</p>
      <Dropdown
        search
        selection
        fluid
        options={roleValueDropdownOptions}
        value={roleKey}
        onChange={(_, { value }) => setRoleKey(value as RoleKey)}
      />
      <br />
      {roleKey && (
        <RoleCard role={ALL_ROLES[roleKey]} />
      )}
    </>
  )
}

export default RoleCardViewer;