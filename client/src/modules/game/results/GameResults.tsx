import { Button } from 'semantic-ui-react';
import styled from 'styled-components'
import { selectIsGreyRoleInPlay, selectRoleEntriesInPlay, selectTeamWinCheckResult } from '../../../selectors/game';
import { Game, Player } from "../../../types/game.types";

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
`;

interface Props {
  game: Game;
  onGameReset(): void;
  player: Player;
}

function GameResults({ game, onGameReset, player }: Props) {

  const teamResult = selectTeamWinCheckResult(game);
  const thing = selectRoleEntriesInPlay(game);
  console.log(thing)
  const isGreyInPlay = selectIsGreyRoleInPlay(game);

  return (
    <Container className="active-contents">
      <Main>
        <h1>Results</h1>
        <h2>Main team win: {teamResult.winningColor}</h2>
        <p>{teamResult.reason}</p>
        {isGreyInPlay && (
          <>
            <h2>Other results</h2>
          </>
        )}
      </Main>
      <Actions>
        {player.isHost && (
          <Button
            color='red'
            fluid
            onClick={onGameReset}
          >
            Restart game
          </Button>
        )}
      </Actions>
    </Container>
  );
}

export default GameResults;