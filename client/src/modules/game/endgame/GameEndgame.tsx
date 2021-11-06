import { Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { selectIsGamblerPredictionNeeded } from "../../../selectors/game";
import { GamblerPrediction, Game, Player } from "../../../types/game.types";
import GameEndgameGambler from './gambler/GameEndgameGambler';

const Container = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "main"
    "actions";
  width: 100%;
`;

const Main = styled.div`
  grid-area: main;
`

const Actions = styled.div`
  grid-area: actions;
`

interface Props {
  game: Game;
  onGamblerPrediction(prediction: GamblerPrediction): void;
  onResultsReveal(): void;
  player: Player;
}

function GameEndgame({ game, onGamblerPrediction, onResultsReveal, player }: Props) {

  const isGamblerPredictionNeeded = selectIsGamblerPredictionNeeded(game);

  if (isGamblerPredictionNeeded) {
    return (
      <GameEndgameGambler {...{ onGamblerPrediction, player }} />
    )
  }

  return (
    <Container className='active-contents'>
      <Main>
        <h1>All rounds are over</h1>
        {player.isHost ? (
          <>
            <p>As host, you can reveal the results when you are ready</p>
          </>
        ) : (
          <>
            <p>Waiting for the host to reveal results...</p>
          </>
        )}
      </Main>
      <Actions>
        {player.isHost && (
          <Button fluid onClick={onResultsReveal} primary>Reveal results</Button>
        )}
      </Actions>
    </Container>
  )
}

export default GameEndgame;