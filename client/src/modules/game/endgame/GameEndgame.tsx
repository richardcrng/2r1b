import styled from 'styled-components';
import { selectIsGamblerPredictionNeeded } from "../../../selectors/game";
import { GamblerPrediction, Game, Player } from "../../../types/game.types";
import GameEndgameGambler from './gambler/GameEndgameGambler';

const Container = styled.div`

`

interface Props {
  game: Game;
  onGamblerPrediction(prediction: GamblerPrediction): void;
  player: Player;
}

function GameEndgame({ game, onGamblerPrediction, player }: Props) {

  const isGamblerPredictionNeeded = selectIsGamblerPredictionNeeded(game);

  if (isGamblerPredictionNeeded) {
    return (
      <GameEndgameGambler {...{ onGamblerPrediction, player }} />
    )
  }

  return (
    <Container className='active-contents'>
      <h1>End game</h1>
      The game is in endgame
    </Container>
  )
}

export default GameEndgame;