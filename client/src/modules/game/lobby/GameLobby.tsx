// import { gameLobbyReadiness } from "../../selectors/game";
import { Game, Player } from "../../../types/game.types";
import GameLobbyHome from "./home/GameLobbyHome";
import { useState } from 'react';
import { RoleKey } from "../../../types/role.types";
import GameLobbySetupModal from "./setup/GameLobbySetupModal";

interface Props {
  game: Game;
  onGameStart(): void;
  onRoleIncrement(roleKey: RoleKey, increment: number): void;
  players: Player[];
  player: Player;
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
