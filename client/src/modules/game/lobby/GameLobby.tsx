import { Game, Player } from "../../../types/game.types";
import GameLobbyHome from "./home/GameLobbyHome";
import { useState } from "react";
import GameLobbySetupModal from "./setup/GameLobbySetupModal";
import { GameHandlers } from "../GamePage";

interface Props
  extends Pick<
    GameHandlers,
    "onGameStart" | "onPlayerKick" | "onRoleIncrement" | "onSettingsUpdate"
  > {
  game: Game;
  players: Player[];
  player: Player;
}

function GameLobby({
  game,
  onGameStart,
  onPlayerKick,
  onRoleIncrement,
  onSettingsUpdate,
  players,
  player,
}: Props): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  return (
    <>
      <GameLobbyHome
        {...{ game, onGameStart, onPlayerKick, players, player }}
        handleViewSetup={handleOpen}
      />
      <GameLobbySetupModal
        {...{ game, onRoleIncrement }}
        isEditable={!!player.isHost}
        isOpen={isModalOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        onSettingsUpdate={onSettingsUpdate}
      />
    </>
  );
}

export default GameLobby;
