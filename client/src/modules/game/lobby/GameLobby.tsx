// import { gameLobbyReadiness } from "../../selectors/game";
import { Game, Player } from "../../../types/game.types";
import GameLobbyHome from "./home/GameLobbyHome";
import { useState } from 'react';
import GameLobbySetupEdit from "./setup/GameLobbySetupEdit";
import GameLobbySetupView from "./setup/GameLobbySetupView";
import { RoleKey } from "../../../types/role.types";

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

  const [view, setView] = useState(LobbyView.HOME)

  const handleViewSetup = () => {
    player.isHost ? setView(LobbyView.SETUP_EDIT) : setView(LobbyView.SETUP_VIEW)
  }

  switch (view) {
    case LobbyView.HOME:
      return (
        <GameLobbyHome
          {...{ game, onGameStart, handleViewSetup, players, player }}
        />
      );
    
      case LobbyView.SETUP_EDIT:
        return <GameLobbySetupEdit game={game} onRoleIncrement={onRoleIncrement} />
      
      case LobbyView.SETUP_VIEW:
        return <GameLobbySetupView />
  }
}

export default GameLobby;
