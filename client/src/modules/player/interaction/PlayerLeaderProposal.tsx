import { Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import PlayerDropdown from "../dropdown/PlayerDropdown";
import { useState } from "react";
import { Button } from "semantic-ui-react";

interface Props {
  player: Player;
  players: Record<string, PlayerWithRoom>;
  currentRoom: RoomName;
  currentLeader?: Player;
  currentVote?: string;
  onAppointLeader(appointedLeaderId: string, roomName: RoomName): void;
  onProposeLeader(
    proposedLeaderId: string | undefined,
    roomName: RoomName
  ): void;
  onPlayerSelect?(playerId: string): void;
  selectedPlayerId?: string;
}
function PlayerLeaderProposal({
  currentRoom,
  currentLeader,
  currentVote,
  onAppointLeader,
  onProposeLeader,
  onPlayerSelect,
  player,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props): JSX.Element {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<
    string | undefined
  >(currentVote);

  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const isPlayerInCurrentRoom = (playerToCheck: Player) =>
    players[playerToCheck.socketId].room === currentRoom;

  const isPlayerCurrentLeader = (playerToCheck: Player) =>
    playerToCheck.socketId === currentLeader?.socketId;

  // eligible if there is a current leader
  const isEligibleIfSelf = (playerToCheck: Player) =>
    playerToCheck.socketId !== player.socketId || !!currentLeader;

  return (
    <>
      {currentLeader ? (
        <>
          <p>
            Although {currentLeader.name} is Leader, you can{" "}
            <strong>Propose</strong> any other player (including yourself!) as a
            replacement.
          </p>
          <p>
            (When over half of players support a proposal, the Leader gets
            replaced.)
          </p>
          {currentVote && (
            <p>
              You are currently proposing{" "}
              <strong>{players[currentVote].name}</strong> for leader.
            </p>
          )}
        </>
      ) : (
        <>
          <p>
            Since there is no Leader, you can unilaterally{" "}
            <strong>Appoint</strong> any other player (but not yourself!) as
            Leader.
          </p>
          <p>(The first such Appointment is effective immediately.)</p>
        </>
      )}
      <PlayerDropdown
        filter={(playerToCheck) =>
          isPlayerInCurrentRoom(playerToCheck) &&
          !isPlayerCurrentLeader(playerToCheck) &&
          isEligibleIfSelf(playerToCheck)
        }
        onPlayerSelect={(id) => {
          setUncontrolledPlayerId(id);
          onPlayerSelect && onPlayerSelect(id);
        }}
        players={players}
        selectedPlayerId={selectedPlayerId}
      />
      <Button
        disabled={!selectedPlayerId}
        fluid
        primary
        onClick={() =>
          currentLeader
            ? onProposeLeader(selectedPlayerId, currentRoom)
            : selectedPlayerId && onAppointLeader(selectedPlayerId, currentRoom)
        }
      >
        {currentLeader ? "Propose as" : "Appoint"} Leader
      </Button>
      {currentVote && (
        <Button
          color="red"
          fluid
          onClick={() => onProposeLeader(undefined, currentRoom)}
        >
          Rescind current proposal
        </Button>
      )}
    </>
  );
}

export default PlayerLeaderProposal;
