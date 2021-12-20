import { useState } from "react";
import { Button, Dropdown } from "semantic-ui-react";
import styled from "styled-components";
import { GamblerPrediction, Player } from "../../../../types/game.types";
import { TeamColor } from "../../../../types/role.types";

const Container = styled.div``;

interface Props {
  onGamblerPrediction(prediction: GamblerPrediction): void;
  player: Player;
}

function GameEndgameGambler({
  onGamblerPrediction,
  player,
}: Props): JSX.Element {
  const [prediction, setPrediction] = useState<GamblerPrediction>();

  return (
    <Container className="active-contents">
      <h1>All rounds are over</h1>
      <h2>Gambler Prediction</h2>
      {player.role === "GAMBLER_GREY" ? (
        <>
          <p>
            As the Gambler, you now need to make a prediction as to which team
            will win.
          </p>
          <Dropdown
            search
            selection
            fluid
            options={[
              { text: "Blue team", value: TeamColor.BLUE },
              { text: "Red team", value: TeamColor.RED },
              { text: "Neither", value: "Neither" },
            ]}
            value={prediction}
            onChange={(_, { value }) => {
              const newPrediction = value as GamblerPrediction;
              setPrediction(newPrediction);
            }}
          />
          <Button
            color="black"
            disabled={!prediction}
            fluid
            onClick={() => prediction && onGamblerPrediction(prediction)}
          >
            Submit prediction
          </Button>
        </>
      ) : (
        <>
          <p>The Gambler is making a prediction as to which team will win.</p>
        </>
      )}
    </Container>
  );
}

export default GameEndgameGambler;
