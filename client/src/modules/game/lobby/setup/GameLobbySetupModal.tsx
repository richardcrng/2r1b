import { useState } from "react";
import { Modal } from "semantic-ui-react";
import {
  selectGamePlayerCount,
  selectGameRolesInSetupCount,
  selectGameSetupErrorsAndWarnings,
  selectNumberOfRolesInSetup,
  selectRolesInSetupAlphabetised,
} from "../../../../selectors/game-selectors";
import { Game } from "../../../../types/game.types";
import { RoleKey } from "../../../../types/role.types";
import RoleAdder from "../../../role/adder/RoleAdder";
import RoleSetup from "../../../role/setup/RoleSetup";
import { GameHandlers } from "../../GamePage";
import GameLobbySetupErrors from "./errors/GameLobbySetupErrors";
import GameLobbySetupSettings from "./settings/GameLobbySetupSettings";

interface Props {
  game: Game;
  isEditable: boolean;
  isOpen: boolean;
  onClose(): void;
  onOpen(): void;
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
  onSettingsUpdate: GameHandlers["onSettingsUpdate"];
}

function GameLobbySetupModal({
  game,
  isEditable,
  isOpen,
  onClose,
  onOpen,
  onRoleIncrement,
  onSettingsUpdate,
}: Props): JSX.Element {
  const [selectedRole, setSelectedRole] = useState<RoleKey>();
  const nPlayers = selectGamePlayerCount(game);
  const nRoles = selectNumberOfRolesInSetup(game);
  const rolesCount = selectGameRolesInSetupCount(game);
  const rolesInSetup = selectRolesInSetupAlphabetised(game);
  const { errors, warnings } = selectGameSetupErrorsAndWarnings(game);

  return (
    <Modal {...{ onClose, onOpen }} closeIcon open={isOpen}>
      <Modal.Header>
        Setup: {nPlayers} players, {nRoles} roles
      </Modal.Header>
      <Modal.Content style={{ maxHeight: "65vh", overflowY: "scroll" }}>
        <GameLobbySetupErrors {...{ errors, warnings }} />
        <br />
        <GameLobbySetupSettings
          {...{ isEditable, onSettingsUpdate }}
          settings={game.settings}
        />
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
