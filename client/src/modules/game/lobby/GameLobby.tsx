// import { gameLobbyReadiness } from "../../selectors/game";
import { Game, Player } from "../../../types/game.types";
import GameLobbyHome from "./home/GameLobbyHome";
import { useState } from 'react';
import GameLobbySetupEdit from "./setup/GameLobbySetupEdit";
import GameLobbySetupView from "./setup/GameLobbySetupView";
import { RoleKey } from "../../../types/role.types";
import { Modal } from "semantic-ui-react";
import GameLobbySetupModal from "./setup/GameLobbySetupModal";

interface Props {
  game: Game;
  onGameStart(): void;
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
  players: Player[];
  player: Player;
}

enum LobbyView {
  HOME = 'home',
  SETUP_EDIT = 'setup-edit',
  SETUP_VIEW = 'setup-view'
}

function GameLobby({ game, onGameStart, onRoleIncrement, players, player }: Props): JSX.Element {


  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpen = () => setIsModalOpen(true)
  const handleClose = () => setIsModalOpen(false)

  return (
    <>
      <GameLobbyHome
        {...{ game, onGameStart, players, player }}
        handleViewSetup={handleOpen}
      />
      <GameLobbySetupModal
        {...{ game, onRoleIncrement }}
        isEditable={!!player.isHost}
        isOpen={isModalOpen}
        onOpen={handleOpen}
        onClose={handleClose}
      />
    </>
  );
}

export default GameLobby;
