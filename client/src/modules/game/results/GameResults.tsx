import styled from 'styled-components'
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

  return (
    <Container className="active-contents">
      <Main>
        <h1>Results</h1>
        <p>Winning team: {game.endgame.winningColor}</p>
      </Main>
    </Container>
  );
}

export default GameResults;