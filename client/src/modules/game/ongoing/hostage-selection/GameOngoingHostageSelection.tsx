import { useState } from 'react';
import { Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { selectCurrentRoundHostageTotal, selectCurrentRoundRoomHostages } from '../../../../selectors/game';
import { Game, Player, RoomName, Round } from '../../../../types/game.types';
import PlayerDropdown from '../../../player/dropdown/PlayerDropdown';

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

const Actions = styled.div`
  grid-area: actions;
`

const HostageOl = styled.ol`
`;


const HostageLi = styled.li`
  div {
    margin-left: 10px;
    display: flex;
    justify-content: space-between;
  }
`;

interface Props {
  game: Game;
  leaderName: string;
  isLeader: boolean;
  onHostageSelect(playerId: string, roomName: RoomName, isDeselect?: boolean): void;
  player: Player;
  players: Record<string, Player>;
  roomName: RoomName;
  round: Round;
}

function GameOngoingHostageSelection({ game, leaderName, isLeader, onHostageSelect, player, players, roomName, round }: Props) {
  
  const currentHostages = selectCurrentRoundRoomHostages(game)[roomName];
  const hostageTotal = selectCurrentRoundHostageTotal(game)!;

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>();

  return (
    <Container className="active-contents">
      <Main>
        <h1>Hostage{hostageTotal === 1 ? "" : "s"} selection</h1>
        <p>
          This round, {hostageTotal} hostage{hostageTotal === 1 ? "" : "s"} must
          be sent to the other room.
        </p>
        {isLeader ? (
          <>
            <p>
              As Room Leader, you must choose the hostage
              {hostageTotal === 1 ? "" : "s"}.
            </p>
            <PlayerDropdown
              filter={(player) =>
                round.playerAllocation[player.socketId] === roomName &&
                !currentHostages.includes(player.socketId)
              }
              onPlayerSelect={setSelectedPlayerId}
              players={players}
            />
            <Button
              disabled={
                !selectedPlayerId || hostageTotal === currentHostages.length
              }
              fluid
              onClick={() => onHostageSelect(selectedPlayerId!, roomName)}
              primary
            >
              Add hostage
            </Button>
          </>
        ) : (
          <p>Waiting for {leaderName} to select and submit hostages</p>
        )}
        <hr />
        {!isLeader && <h3>Selected hostage{hostageTotal === 1 ? "" : "s"}</h3>}
        {currentHostages.length === 0 ? (
          <p>No hostage{hostageTotal === 1 ? "" : "s"} selected</p>
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
          <Button color="black" fluid>
            Submit hostages
          </Button>
        )}
      </Actions>
    </Container>
  );
}

export default GameOngoingHostageSelection;