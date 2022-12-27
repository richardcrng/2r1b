import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from "styled-components";
import {
  selectCurrentRoundHostageTotal,
  selectCurrentRoundRoomHostages,
} from "../../../../selectors/game-selectors";
import { Game, Player, RoomName, Round } from "../../../../types/game.types";
import PlayerDropdown from "../../../player/dropdown/PlayerDropdown";

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

const HostageOl = styled.ol``;

const HostageLi = styled.li`
  div {
    margin-left: 10px;
    display: flex;
    justify-content: space-between;
  }
`;

const RoomGuideUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 1rem;

  li {
    padding-left: 1rem;
    text-indent: -0.7rem;
  }

  li.incomplete::before {
    content: "🤔 ";
  }

  li.complete::before {
    content: "✅ ";
  }
`;

interface Props {
  game: Game;
  leaderName: string;
  isLeader: boolean;
  onHostageSelect(
    playerId: string,
    roomName: RoomName,
    isDeselect?: boolean
  ): void;
  onHostageSubmit(roomName: RoomName): void;
  player: Player;
  players: Record<string, Player>;
  roomName: RoomName;
  round: Round;
}

function GameOngoingHostageSelection({
  game,
  leaderName,
  isLeader,
  onHostageSelect,
  onHostageSubmit,
  player,
  players,
  roomName,
  round,
}: Props): JSX.Element {
  const currentHostages = selectCurrentRoundRoomHostages(game)[roomName];
  const hostageTotal = selectCurrentRoundHostageTotal(game);
  const isRightHostageCount = hostageTotal === currentHostages.length;

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>();

  const { isReadyToExchange } = round.rooms[roomName];

  const maybeS = hostageTotal === 1 ? "" : "s";

  return (
    <Container className="active-contents">
      <Main>
        <h1>Situation Room {roomName}</h1>
        <h2>Hostage{maybeS} selection</h2>
        {isLeader ? (
          <>
            <p>
              As Room Leader, you must <strong>select</strong> and{" "}
              <strong>submit</strong> {hostageTotal} hostage
              {maybeS} this round (but cannot pick yourself).
            </p>

            <RoomGuideUl>
              <li className={isRightHostageCount ? "complete" : "incomplete"}>
                <strong>Selection</strong>:{" "}
                {isRightHostageCount
                  ? "You have completed hostage selection"
                  : `${hostageTotal - currentHostages.length} left to pick`}
              </li>
              <li className={isReadyToExchange ? "complete" : "incomplete"}>
                <strong>Submission</strong>:{" "}
                {isReadyToExchange
                  ? "Complete"
                  : isRightHostageCount
                  ? "You can submit your hostage selection when you are ready"
                  : "You must complete selection first"}
              </li>
            </RoomGuideUl>

            <PlayerDropdown
              filter={(p) =>
                player.socketId !== p.socketId &&
                round.playerAllocation[p.socketId] === roomName &&
                !currentHostages.includes(p.socketId)
              }
              onPlayerSelect={setSelectedPlayerId}
              players={players}
            />
            <Button
              disabled={
                !selectedPlayerId || isRightHostageCount || isReadyToExchange
              }
              fluid
              onClick={() =>
                selectedPlayerId && onHostageSelect(selectedPlayerId, roomName)
              }
              primary
            >
              Select hostage
            </Button>
          </>
        ) : (
          <>
            <p>
              This round, {hostageTotal} hostage{maybeS} must be sent to the
              other room.
            </p>
            <p>
              {isReadyToExchange
                ? `Waiting for the other room to select and submit their hostage${maybeS}`
                : `Waiting for ${leaderName} to select and submit hostages`}
            </p>
          </>
        )}
        <hr />
        {!isLeader && <h3>Selected hostage{maybeS}</h3>}
        {currentHostages.length === 0 ? (
          <p>No hostage{maybeS} selected</p>
        ) : (
          <HostageOl>
            {currentHostages.map((playerId) => (
              <HostageLi key={playerId}>
                <div>
                  <span>{players[playerId].name}</span>
                  {isLeader && (
                    <button
                      onClick={() => onHostageSelect(playerId, roomName, true)}
                    >
                      X
                    </button>
                  )}
                </div>
              </HostageLi>
            ))}
          </HostageOl>
        )}
      </Main>
      <Actions>
        {isLeader && (
          <>
            {isReadyToExchange && (
              <p>
                Waiting for the other room to select and submit their hostage
                {maybeS}
              </p>
            )}
            <Button
              disabled={!isRightHostageCount || isReadyToExchange}
              color="black"
              fluid
              onClick={() => onHostageSubmit(roomName)}
            >
              Submit hostages
            </Button>
          </>
        )}
      </Actions>
    </Container>
  );
}

export default GameOngoingHostageSelection;
