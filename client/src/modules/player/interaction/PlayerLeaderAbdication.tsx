import { Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import PlayerDropdown from "../dropdown/PlayerDropdown";
import { useState } from "react";
import { Button } from "semantic-ui-react";

interface Props {
  player: Player;
  players: Record<string, PlayerWithRoom>;
  currentRoom: RoomName;
  currentOfferId?: string;
  onOfferAbdication(currentRoom: RoomName, playerId?: string): void;
  onPlayerSelect?(playerId: string): void;
  selectedPlayerId?: string;
}
function PlayerLeaderAbdication({
  currentRoom,
  currentOfferId,
  onOfferAbdication,
  onPlayerSelect,
  player,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props) {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<
    string | undefined
  >(currentOfferId);

  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const isPlayerInCurrentRoom = (playerToCheck: Player) =>
    players[playerToCheck.socketId].room === currentRoom;

  return (
    <>
      <p>Since you are leader, you can offer to abdicate leadership.</p>
      <p>{currentOfferId ? (
        <>You can't offer to abdicate to anybody until you withdraw your existing offer to {players[currentOfferId].name}.</>
      ) : <>You have no offer pending.</>}</p>
      <PlayerDropdown
        disabled={!!currentOfferId}
        filter={(playerToCheck) =>
          isPlayerInCurrentRoom(playerToCheck) &&
          playerToCheck.socketId !== player.socketId
        }
        onPlayerSelect={(id) => {
          setUncontrolledPlayerId(id);
          onPlayerSelect && onPlayerSelect(id);
        }}
        players={players}
        selectedPlayerId={currentOfferId ?? selectedPlayerId}
      />
      <Button
        disabled={!!currentOfferId || !selectedPlayerId}
        fluid
        primary
        onClick={() => onOfferAbdication(currentRoom, selectedPlayerId)}
      >
        Offer abdication
      </Button>
      <Button
        color="red"
        disabled={!currentOfferId}
        fluid
        onClick={() => onOfferAbdication(currentRoom, undefined)}
      >
        Rescind current offer
      </Button>
    </>
  );
}

export default PlayerLeaderAbdication;
