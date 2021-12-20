import { Button } from "semantic-ui-react";
import { RoleKey } from "../../../types/role.types";
import RoleDropdown from "../dropdown/RoleDropdown";
import { getRoleRestrictions } from "../../../utils/role-utils";

interface Props {
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
  onRoleSelect(roleKey?: RoleKey): void;
  rolesCount: Record<RoleKey, number>;
  selectedRole?: RoleKey;
}

function RoleAdder({
  onRoleIncrement,
  onRoleSelect,
  rolesCount,
  selectedRole,
}: Props): JSX.Element {
  const handleIncrement = () => {
    if (!selectedRole)
      throw new Error("Can't increment without a role existing");
    const roleToIncrement = selectedRole;
    const currentCount = rolesCount[roleToIncrement];
    const { roleMax } = getRoleRestrictions(roleToIncrement);
    if (currentCount < roleMax) {
      onRoleIncrement(selectedRole, 1);
    } else {
      window.alert(`Already at max count for ${roleToIncrement}`);
    }
    onRoleSelect(undefined);
  };

  return (
    <>
      <RoleDropdown
        filter={(role) => {
          const currentCount = rolesCount[role.key];
          return currentCount === 0;
        }}
        selectedRole={selectedRole}
        onRoleSelect={onRoleSelect}
      />
      <Button fluid primary disabled={!selectedRole} onClick={handleIncrement}>
        Add role
      </Button>
    </>
  );
}

export default RoleAdder;
