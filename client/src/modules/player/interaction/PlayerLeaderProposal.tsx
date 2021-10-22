import { Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import PlayerDropdown from "../dropdown/PlayerDropdown";
import { useState } from 'react';
import { Button } from "semantic-ui-react";


interface Props {
  player: Player;
  players: Record<string, PlayerWithRoom>;
  currentRoom: RoomName;
  currentLeader?: Player;
  onAppointLeader(appointedLeaderId: string, roomName: RoomName): void;
  onProposeLeader(proposedLeaderId: string, roomName: RoomName): void;
}
function PlayerLeaderProposal({
  currentRoom,
  currentLeader,
  onAppointLeader,
  onProposeLeader,
  player,
  players,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>()

  const isPlayerInCurrentRoom = (playerToCheck: Player) =>
    players[playerToCheck.socketId].room === currentRoom;
  
  const isPlayerCurrentLeader = (playerToCheck: Player) =>
    playerToCheck.socketId === currentLeader?.socketId;

  // eligible if there is a current leader
  const isEligibleIfSelf = (playerToCheck: Player) => (playerToCheck.socketId !== player.socketId) || !!currentLeader

  return (
    <>
      {currentLeader ? (
        <>
          <p>Although {currentLeader.name} is Leader, you can <strong>Propose</strong> any other player (including yourself!) as a replacement.</p>
          <p>(When over half of players support a proposal, the Leader gets replaced.)</p>
        </>
      ) : (
        <>
          <p>Since there is no Leader, you can unilaterally <strong>Appoint</strong> any other player (but not yourself!) as Leader.</p>
          <p>(The first such Appointment is effective immediately.)</p>
        </>
      )}
      <PlayerDropdown
        filter={(playerToCheck) => isPlayerInCurrentRoom(playerToCheck) && !isPlayerCurrentLeader(playerToCheck) && isEligibleIfSelf(playerToCheck)}
        onPlayerSelect={(id) => setSelectedId(id)}
        players={players}
        selectedPlayerId={selectedId}
      />
      <Button
        disabled={!selectedId}
        fluid
        primary
        onClick={() => currentLeader ? onProposeLeader(selectedId!, currentRoom) : onAppointLeader(selectedId!, currentRoom)}
      >
        {currentLeader ? "Propose" : "Appoint"} Leader
      </Button>
    </>
  )
}

export default PlayerLeaderProposal;