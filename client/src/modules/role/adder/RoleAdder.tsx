import { Button } from "semantic-ui-react";
import { ALL_ROLES, RoleKey } from "../../../types/role.types";
import RoleDropdown from "../dropdown/RoleDropdown";

interface Props {
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
  onRoleSelect(roleKey?: RoleKey): void;
  rolesCount: Record<RoleKey, number>;
  selectedRole?: RoleKey;
}

function RoleAdder({ onRoleIncrement, onRoleSelect, rolesCount, selectedRole }: Props) {
  const handleIncrement = () => {
    const roleToIncrement = selectedRole!;
    const currentCount = rolesCount[roleToIncrement];
    const maxCount = ALL_ROLES[roleToIncrement].restrictions.roleMax;
    if (currentCount < maxCount) {
      onRoleIncrement(selectedRole!, 1);
      if (currentCount + 1 === maxCount) {
        onRoleSelect(undefined);
      }
    } else {
      window.alert(`Already at max count for ${roleToIncrement}`);
    }
  };

  return (
    <>
      <RoleDropdown
        filter={(role) => {
          const currentCount = rolesCount[role.key];
          return currentCount < ALL_ROLES[role.key].restrictions.roleMax;
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