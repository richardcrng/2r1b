import { Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import PlayerDropdown from "../dropdown/PlayerDropdown";
import { useState } from "react";
import { Button } from "semantic-ui-react";
import { PlayerActionAbdicationOffered } from "../../../types/player-action.types";

interface Props {
  player: Player;
  players: Record<string, PlayerWithRoom>;
  currentRoom: RoomName;
  currentOffer?: PlayerActionAbdicationOffered;
  onOfferAbdication(currentRoom: RoomName, playerId?: string): void;
  onWithdrawAbdicationOffer(action: PlayerActionAbdicationOffered): void;
  onPlayerSelect?(playerId: string): void;
  selectedPlayerId?: string;
}
function PlayerLeaderAbdication({
  currentRoom,
  currentOffer,
  onOfferAbdication,
  onPlayerSelect,
  // onWithdrawAbdicationOffer,
  player,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props): JSX.Element {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<
    string | undefined
  >(currentOffer?.proposedNewLeaderId);

  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const isPlayerInCurrentRoom = (playerToCheck: Player) =>
    players[playerToCheck.socketId].room === currentRoom;

  return (
    <>
      <p>Since you are leader, you can offer to abdicate leadership.</p>
      <p>
        {currentOffer ? (
          <>
            You can't offer to abdicate to anybody until you withdraw your
            existing offer to {players[currentOffer.proposedNewLeaderId].name}.
          </>
        ) : (
          <>You have no offer pending.</>
        )}
      </p>
      <PlayerDropdown
        disabled={!!currentOffer?.proposedNewLeaderId}
        filter={(playerToCheck) =>
          isPlayerInCurrentRoom(playerToCheck) &&
          playerToCheck.socketId !== player.socketId
        }
        onPlayerSelect={(id) => {
          setUncontrolledPlayerId(id);
          onPlayerSelect && onPlayerSelect(id);
        }}
        players={players}
        selectedPlayerId={currentOffer?.proposedNewLeaderId ?? selectedPlayerId}
      />
      <Button
        disabled={!!currentOffer?.proposedNewLeaderId || !selectedPlayerId}
        fluid
        primary
        onClick={() => onOfferAbdication(currentRoom, selectedPlayerId)}
      >
        Offer abdication
      </Button>
    </>
  );
}

export default PlayerLeaderAbdication;
