import styled from 'styled-components'
import { Card, Game, Player } from "../../../types/game.types";

interface Props {
  game: Game;
  player: Player;
  onCardClick: (card: Card, idx: number, player: Player) => void;
  onNextRound: () => void;
  onGameRestart: () => void;
}

const Container = styled.div`
  width: 100%;
`

function GameOngoing({ game, player, onCardClick, onGameRestart, onNextRound }: Props) {

  return (
    <Container className="active-contents flex-between">
      Game is ongoing
      <pre>{JSON.stringify(game, null, 2)}</pre>
    </Container>
  );
}

export default GameOngoing;
