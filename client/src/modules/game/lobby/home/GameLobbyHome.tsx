/* eslint-disable jsx-a11y/anchor-is-valid */

import { useCopyToClipboard } from "react-use";
import { Button } from "semantic-ui-react";
import styled from "styled-components";
// import { gameLobbyReadiness } from "../../selectors/game";
import { GameBase, Player } from "../../../../types/game.types";
import PlayerList from "../../../../lib/atoms/PlayerList";
import PlayerAvatar from "../../../../lib/atoms/PlayerAvatar";
import { GameLobbyReadiness } from "../../../../selectors/game";

interface Props {
  game: GameBase;
  handleViewSetup(): void;
  onGameStart(): void;
  players: Player[];
  player: Player;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ActionArea = styled.div`
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

function GameLobbyHome({ game, onGameStart, handleViewSetup, players, player }: Props) {
  // const readiness = gameLobbyReadiness(game);
  const readiness: GameLobbyReadiness = { isReady: false };
  // eslint-disable-next-line
  const [_, copyToClipboard] = useCopyToClipboard();

  const disableStart = !readiness.isReady;

  return (
    <Container className="active-contents">
      <div style={{ width: "100%" }}>
        <h1 style={{ textAlign: "center" }}>Game id: {game.id}</h1>
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
        <PlayerList
          players={players}
          ownPlayerId={player.socketId}
          listParent={({ children }) => (
            <ol style={{ listStyle: "none", paddingInlineStart: "20px" }}>
              {children}
            </ol>
          )}
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
      </div>
      <ActionArea>
        {!readiness.isReady && (
          <p>
            The game cannot yet be started
            {readiness.reason && ": " + readiness.reason.toLowerCase()}.
          </p>
        )}
        {player.isHost ? (
          <>
            <Button
              fluid
              primary
              disabled={disableStart}
              onClick={() => {
                onGameStart();
              }}
            >
              Start game
            </Button>
          </>
        ) : (
          <p>Waiting for the host to start the game</p>
        )}
        <Button fluid onClick={handleViewSetup}>{player.isHost ? "Edit" : "View"} setup</Button>
      </ActionArea>
    </Container>
  );
}

export default GameLobbyHome;
