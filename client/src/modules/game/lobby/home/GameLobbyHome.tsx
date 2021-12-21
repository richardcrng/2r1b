/* eslint-disable jsx-a11y/anchor-is-valid */

import { useCopyToClipboard } from "react-use";
import { Button, Message } from "semantic-ui-react";
import styled from "styled-components";
// import { gameLobbyReadiness } from "../../selectors/game";
import { Game, Player } from "../../../../types/game.types";
import PlayerList from "../../../../lib/atoms/PlayerList";
import { SetupAlert } from "../../../../utils/setup-utils";
import { selectGameSetupErrorsAndWarnings } from "../../../../selectors/game-selectors";
import { GameHandlers } from "../../GamePage";

interface Props extends Pick<GameHandlers, "onGameStart" | "onPlayerKick"> {
  game: Game;
  handleViewSetup(): void;
  players: Player[];
  player: Player;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header"
    "players"
    "actions";
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  grid-area: header;
  width: 100%;
`;

const StyledPlayerList = styled(PlayerList)`
  grid-area: players;
  overflow-y: scroll;
  padding-inline-start: 20px;
`;

const ActionArea = styled.div`
  grid-area: actions;
  width: 100%;
`;

const StyledA = styled.a`
  display: block;
  text-align: center;
`;

const PlayerListItemContents = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  font-size: 1.2rem;
  justify-content: space-between;
  padding-bottom: 10px;

  p {
    margin: 0;
  }

  button {
    font-size: 0.9rem;
    margin: 0;
  }
`;

function GameLobbyHome({
  game,
  onGameStart,
  onPlayerKick,
  handleViewSetup,
  players,
  player,
}: Props): JSX.Element {
  const { errors, warnings } = selectGameSetupErrorsAndWarnings(game);

  const isReadyToStartGame = errors.length === 0;

  // eslint-disable-next-line
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <Container className="active-contents">
      <Header>
        <h1 style={{ textAlign: "center", marginBottom: 0 }}>
          Game id: {game.id}
        </h1>
        <StyledA
          onClick={(e) => {
            e.preventDefault();
            copyToClipboard(window.location.href);
            window.alert(`Copied to clipboard: ${window.location.href}`);
          }}
          href="#"
        >
          Copy game join link
        </StyledA>
        <Message
          color={errors.length ? "red" : warnings.length ? "yellow" : "green"}
          onClick={handleViewSetup}
        >
          <Message.Header>
            {errors.length
              ? "Hold on!"
              : warnings.length
              ? "Be careful!"
              : "Looks great!"}
          </Message.Header>
          <Message.Content>{setupMessage(errors, warnings)}</Message.Content>
        </Message>
      </Header>
      <StyledPlayerList
        players={players}
        ownPlayerId={player.socketId}
        renderPlayer={(playerToRender, idx, ownPlayerId) => {
          return (
            <PlayerListItemContents>
              <p style={{ marginLeft: "10px" }}>
                {playerToRender.name}
                {playerToRender.socketId === ownPlayerId && " (you)"}
                {playerToRender.isHost && " (host)"}
              </p>
              {player.isHost && playerToRender.socketId !== player.socketId && (
                <button onClick={() => onPlayerKick(playerToRender.socketId)}>
                  x
                </button>
              )}
            </PlayerListItemContents>
          );
        }}
      />
      <ActionArea>
        <Button fluid onClick={handleViewSetup}>
          {player.isHost ? "Edit" : "View"} setup
        </Button>
        {player.isHost && (
          <>
            <Button
              fluid
              primary
              disabled={!isReadyToStartGame}
              onClick={() => {
                onGameStart();
              }}
            >
              Start game
            </Button>
          </>
        )}
      </ActionArea>
    </Container>
  );
}

const setupMessage = (
  errors: SetupAlert[],
  warnings: SetupAlert[]
): JSX.Element => {
  const nErrors = errors.length;
  const nWarnings = warnings.length;

  if (nErrors >= 2) {
    return (
      <>
        {nErrors} errors: {errors[0].message}, and {nErrors - 1} more
      </>
    );
  } else if (nErrors === 1) {
    return <>{errors[0].message}</>;
  } else if (nWarnings >= 2) {
    return (
      <>
        {nWarnings} warnings: {warnings[0].message}, and {nWarnings - 1} more
      </>
    );
  } else if (nWarnings === 1) {
    return <>{warnings[0].message}</>;
  } else {
    return <>No setup errors or warnings!</>;
  }
};

export default GameLobbyHome;
