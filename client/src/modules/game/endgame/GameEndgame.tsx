import { Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { selectGameRolesInSetupCount, selectIsGamblerPredictionNeeded, selectIsPrivateEyeIdentificationNeeded } from "../../../selectors/game-selectors";
import { GamblerPrediction, Game, Player } from "../../../types/game.types";
import { RoleKey } from '../../../types/role.types';
import GameEndgameGambler from './gambler/GameEndgameGambler';
import GameEndgamePrivateEye from './private-eye/GameEndgamePrivateEye';

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
  onPrivateEyeRolePrediction(roleKey: RoleKey): void;
  onResultsReveal(): void;
  player: Player;
}

function GameEndgame({ game, onGamblerPrediction, onPrivateEyeRolePrediction, onResultsReveal, player }: Props) {

  const isPrivateEyeIdentificationNeeded = selectIsPrivateEyeIdentificationNeeded(game);
  const isGamblerPredictionNeeded = selectIsGamblerPredictionNeeded(game);

  if (isPrivateEyeIdentificationNeeded) {
    return (
      <GameEndgamePrivateEye
        onPrivateEyeRolePrediction={onPrivateEyeRolePrediction}
        player={player}
        rolesCount={selectGameRolesInSetupCount(game)}
      />
    )
  } else if (isGamblerPredictionNeeded) {
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