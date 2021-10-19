// import { gameLobbyReadiness } from "../../selectors/game";
import { GameBase, Player } from "../../../types/game.types";
import GameLobbyHome from "./home/GameLobbyHome";
import { useState } from 'react';
import GameLobbySetupEdit from "./setup/GameLobbySetupEdit";
import GameLobbySetupView from "./setup/GameLobbySetupView";

interface Props {
  game: GameBase;
  handleStartGame(): void;
  players: Player[];
  player: Player;
}

enum LobbyView {
  HOME = 'home',
  SETUP_EDIT = 'setup-edit',
  SETUP_VIEW = 'setup-view'
}

function GameLobby({ game, handleStartGame, players, player }: Props): JSX.Element {

  const [view, setView] = useState(LobbyView.HOME)

  const handleViewSetup = () => {
    player.isHost ? setView(LobbyView.SETUP_EDIT) : setView(LobbyView.SETUP_VIEW)
  }

  switch (view) {
    case LobbyView.HOME:
      return (
        <GameLobbyHome
          {...{ game, handleStartGame, handleViewSetup, players, player }}
        />
      );
    
      case LobbyView.SETUP_EDIT:
        return <GameLobbySetupEdit />
      
      case LobbyView.SETUP_VIEW:
        return <GameLobbySetupView />
  }
}

export default GameLobby;
