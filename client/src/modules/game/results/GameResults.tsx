import { Button } from "semantic-ui-react";
import styled from "styled-components";
import { selectTeamWinCheckResult } from "../../../selectors/endgame-selectors";
import { selectFindPlayerWithRole } from "../../../selectors/game-selectors";
import { selectGreyPlayerResults } from "../../../selectors/grey-results";
import { Game, Player } from "../../../types/game.types";
import { getRoleName } from "../../../utils/role-utils";

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
`;

const Actions = styled.div`
  grid-area: actions;
`;

interface Props {
  game: Game;
  onGameReset(): void;
  player: Player;
}

function GameResults({ game, onGameReset, player }: Props): JSX.Element {
  const teamResult = selectTeamWinCheckResult(game);
  const greyResults = selectGreyPlayerResults(game);
  const findPlayerWithRole = selectFindPlayerWithRole(game);

  return (
    <Container className="active-contents">
      <Main>
        <h1>Results</h1>
        <h2>Main team win: {teamResult.winningColor}</h2>
        <p>{teamResult.reason}</p>
        {greyResults.length > 0 && (
          <>
            <h2>Grey players</h2>
            <ol>
              {greyResults.map((result) => (
                <li key={result.role}>
                  <p>
                    <strong>
                      {getRoleName(result.role)} {result.isWin ? "win" : "loss"}{" "}
                      ({findPlayerWithRole(result.role)?.name}):{" "}
                    </strong>
                    {result.reason}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}
      </Main>
      <Actions>
        {player.isHost && (
          <Button color="red" fluid onClick={onGameReset}>
            Restart game
          </Button>
        )}
      </Actions>
    </Container>
  );
}

export default GameResults;
