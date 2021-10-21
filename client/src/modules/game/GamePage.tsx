import { Card, Game, GameStatus, Player } from "../../types/game.types";
import { RoleKey } from "../../types/role.types";
import GameLobby from "./lobby/GameLobby";
import GameOngoing from "./ongoing/GameOngoing";

interface Props {
  game: Game;
  onGameStart(): void;
  onCardClick: (card: Card, idx: number, player: Player) => void;
  onGameRestart: () => void;
  onNextRound: () => void;
  onRoleIncrement: (roleKey: RoleKey, increment: number) => void;
  players: Player[];
  player: Player;
}

function GamePage({
  game,
  onGameStart,
  onCardClick,
  onGameRestart,
  onNextRound,
  onRoleIncrement,
  players,
  player,
}: Props) {
  if (game.status === GameStatus.LOBBY) {
    return <GameLobby {...{ game, onGameStart, onRoleIncrement, players, player }} />;
  } else {
    return <GameOngoing {...{ game, player, onCardClick, onGameRestart, onNextRound }} />;
  }
}

export default GamePage;
