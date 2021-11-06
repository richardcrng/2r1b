import styled from 'styled-components'
import { selectIsGreyRoleInPlay, selectTeamWinCheckResult } from '../../../selectors/game';
import { Game } from "../../../types/game.types";

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

interface Props {
  game: Game;
}

function GameResults({ game }: Props) {

  const teamResult = selectTeamWinCheckResult(game);
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
    </Container>
  );
}

export default GameResults;