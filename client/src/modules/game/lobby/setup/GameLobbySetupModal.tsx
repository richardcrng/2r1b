import { useState } from "react";
import { Modal } from "semantic-ui-react";
import styled from "styled-components";
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

interface Props {
  game: Game;
  isEditable: boolean;
  isOpen: boolean;
  onClose(): void;
  onOpen(): void;
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
}

const ErrorAndWarningList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding-left: 1rem;
    text-indent: -0.7rem;
  }

  li.error::before {
    content: "🚨 ";
  }

  li.warning::before {
    content: "⚠️ ";
  }
`;

function GameLobbySetupModal({
  game,
  isEditable,
  isOpen,
  onClose,
  onOpen,
  onRoleIncrement,
}: Props) {
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
      <Modal.Content>
        {(errors.length || warnings.length) && (
          <details>
            <summary
              style={{
                color: errors.length ? "red" : "orange",
                fontWeight: "bold",
              }}
            >
              {errorAndWarningsTitle(errors.length, warnings.length)}
            </summary>
            <ErrorAndWarningList>
              {errors.map((error) => (
                <li className="error" key={error.message}>
                  {error.message}
                </li>
              ))}
              {warnings.map((warning) => (
                <li className="warning" key={warning.message}>
                  {warning.message}
                </li>
              ))}
            </ErrorAndWarningList>
          </details>
        )}
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

const errorAndWarningsTitle = (nErrors: number, nWarnings: number): string => {
  const messages: string[] = [];

  if (nErrors > 1) {
    messages.push(`${nErrors} errors`);
  } else if (nErrors === 1) {
    messages.push(`${nErrors} error`);
  }

  if (nWarnings > 1) {
    messages.push(`${nWarnings} warnings`);
  } else if (nWarnings === 1) {
    messages.push(`${nWarnings} warning`);
  }

  return messages.join(", ");
};

export default GameLobbySetupModal;
