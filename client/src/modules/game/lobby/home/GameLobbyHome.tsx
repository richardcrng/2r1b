/* eslint-disable jsx-a11y/anchor-is-valid */

import { useCopyToClipboard } from "react-use";
import { Button, Message } from "semantic-ui-react";
import styled from "styled-components";
// import { gameLobbyReadiness } from "../../selectors/game";
import { Game, Player } from "../../../../types/game.types";
import PlayerList from "../../../../lib/atoms/PlayerList";
import PlayerAvatar from "../../../../lib/atoms/PlayerAvatar";
import {
  selectGameSetupErrors,
  selectGameSetupWarnings,
} from "../../../../selectors/game-selectors";
import { SetupAlert } from "../../../../utils/setup-utils";

interface Props {
  game: Game;
  handleViewSetup(): void;
  onGameStart(): void;
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
  list-style: none;
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
  font-size: 1.2rem;
  padding-bottom: 10px;
`;

function GameLobbyHome({
  game,
  onGameStart,
  handleViewSetup,
  players,
  player,
}: Props) {
  const setupErrors = selectGameSetupErrors(game);
  const setupWarnings = selectGameSetupWarnings(game);

  const isReadyToStartGame = setupErrors.length === 0;

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
          color={
            setupErrors.length
              ? "red"
              : setupWarnings.length
              ? "yellow"
              : "green"
          }
          onClick={handleViewSetup}
        >
          <Message.Header>
            {setupErrors.length
              ? "Hold on!"
              : setupWarnings.length
              ? "Be careful!"
              : "Looks great!"}
          </Message.Header>
          <Message.Content>
            {setupMessage(setupErrors, setupWarnings)}
          </Message.Content>
        </Message>
      </Header>
      <StyledPlayerList
        players={players}
        ownPlayerId={player.socketId}
        renderPlayer={(player, idx, ownPlayerId) => {
          return (
            <PlayerListItemContents>
              <span style={{ marginRight: "10px" }}>{idx + 1}.</span>
              <PlayerAvatar player={player} size={32} />
              <p style={{ marginLeft: "10px" }}>
                {player.name}
                {player.socketId === ownPlayerId && " (you)"}
                {player.isHost && " (host)"}
              </p>
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
