import { useState } from "react";
import { Modal } from "semantic-ui-react";
import { selectGameRolesInPlayCount, selectGameSetupAlerts, selectRolesInSetupAlphabetised } from "../../../../selectors/game";
import { Game } from "../../../../types/game.types";
import { RoleKey } from "../../../../types/role.types";
import RoleAdder from "../../../role/adder/RoleAdder";
import RoleSetup from "../../../role/setup/RoleSetup";


interface Props {
  game: Game;
  isEditable: boolean;
  isOpen: boolean;
  onClose(): void;
  onOpen(): void;
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
}

function GameLobbySetupModal({ game, isEditable, isOpen, onClose, onOpen, onRoleIncrement }: Props) {
  const [selectedRole, setSelectedRole] = useState<RoleKey>();
  const rolesCount = selectGameRolesInPlayCount(game);
  const rolesInSetup = selectRolesInSetupAlphabetised(game);
  const setupAlerts = selectGameSetupAlerts(game);

  console.log("alerts", setupAlerts)

  return (
    <Modal
      {...{ onClose, onOpen }}
      closeIcon
      open={isOpen}
    >
      <Modal.Header>Role setup</Modal.Header>
      <Modal.Content>
        <RoleSetup {...{ isEditable, rolesInSetup, onRoleIncrement }} />
        {isEditable && (
          <RoleAdder
            {...{ onRoleIncrement, rolesCount, selectedRole }}
            onRoleSelect={(role) => setSelectedRole(role)}
          />
        )}
      </Modal.Content>
    </Modal>
  );
}

export default GameLobbySetupModal;