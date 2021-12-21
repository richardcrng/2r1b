import { Button } from "semantic-ui-react";
import styled from "styled-components";
import {
  selectIsGamblerPredictionNeeded,
  selectIsPrivateEyeIdentificationNeeded,
  selectIsSniperShotNeeded,
} from "../../../selectors/endgame-selectors";
import { selectGameRolesInSetupCount } from "../../../selectors/game-selectors";
import { Game, Player } from "../../../types/game.types";
import { GameHandlers } from "../GamePage";
import GameEndgameGambler from "./gambler/GameEndgameGambler";
import GameEndgamePrivateEye from "./private-eye/GameEndgamePrivateEye";
import GameEndgameSniper from "./sniper/GameEndgameSniper";

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

interface Props
  extends Pick<
    GameHandlers,
    | "onGamblerPrediction"
    | "onPrivateEyeRolePrediction"
    | "onResultsReveal"
    | "onSniperShot"
  > {
  game: Game;
  player: Player;
}

function GameEndgame({
  game,
  onGamblerPrediction,
  onPrivateEyeRolePrediction,
  onResultsReveal,
  onSniperShot,
  player,
}: Props): JSX.Element {
  if (selectIsPrivateEyeIdentificationNeeded(game)) {
    return (
      <GameEndgamePrivateEye
        onPrivateEyeRolePrediction={onPrivateEyeRolePrediction}
        player={player}
        rolesCount={selectGameRolesInSetupCount(game)}
      />
    );
  } else if (selectIsGamblerPredictionNeeded(game)) {
    return <GameEndgameGambler {...{ onGamblerPrediction, player }} />;
  } else if (selectIsSniperShotNeeded(game)) {
    return (
      <GameEndgameSniper {...{ onSniperShot, player, players: game.players }} />
    );
  }

  return (
    <Container className="active-contents">
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
          <Button fluid onClick={onResultsReveal} primary>
            Reveal results
          </Button>
        )}
      </Actions>
    </Container>
  );
}

export default GameEndgame;
