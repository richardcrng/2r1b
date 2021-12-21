import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from "styled-components";
import { Player } from "../../../../types/game.types";
import PlayerDropdown from "../../../player/dropdown/PlayerDropdown";
import { GameHandlers } from "../../GamePage";

const Container = styled.div``;

interface Props {
  onSniperShot: GameHandlers["onSniperShot"];
  player: Player;
  players: Record<string, Player>;
}

function GameEndgameSniper({
  onSniperShot,
  player,
  players,
}: Props): JSX.Element {
  const [targetPlayerId, setTargetPlayerId] = useState<string>();

  return (
    <Container className="active-contents">
      <h1>All rounds are over</h1>
      <h2>Sniper Shot</h2>
      {player.role === "SNIPER_GREY" ? (
        <>
          <p>As the Sniper, you now need to choose a player to shoot.</p>
          <PlayerDropdown
            filter={({ socketId }) => socketId !== player.socketId}
            onPlayerSelect={(id) => setTargetPlayerId(id)}
            players={players}
            selectedPlayerId={targetPlayerId}
          />
          <Button
            color="black"
            disabled={!targetPlayerId}
            onClick={() => targetPlayerId && onSniperShot(targetPlayerId)}
          >
            Submit prediction
          </Button>
        </>
      ) : (
        <>
          <p>The Sniper is choosing a player to Shoot.</p>
        </>
      )}
    </Container>
  );
}

export default GameEndgameSniper;
