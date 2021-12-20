import { Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import PlayerDropdown from "../dropdown/PlayerDropdown";
import { useState } from "react";
import { Button } from "semantic-ui-react";
import {
  PlayerActionShareOffered,
  PlayerActionShareOfferedType,
  PlayerActionType,
} from "../../../types/player-action.types";

interface Props {
  colorSharing?: boolean;
  currentRoom: RoomName;
  currentOffer?: PlayerActionShareOffered;
  onOfferShare(
    currentRoom: RoomName,
    playerId: string,
    shareType: PlayerActionShareOfferedType
  ): void;
  onPlayerSelect?(playerId: string): void;
  player: Player;
  players: Record<string, PlayerWithRoom>;
  selectedPlayerId?: string;
}
function PlayerShareOffer({
  colorSharing,
  currentRoom,
  currentOffer,
  onOfferShare,
  onPlayerSelect,
  player,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props): JSX.Element {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<
    string | undefined
  >(currentOffer?.offeredPlayerId);

  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const isPlayerInCurrentRoom = (playerToCheck: Player) =>
    players[playerToCheck.socketId].room === currentRoom;

  return (
    <>
      <p>You can offer a mutual card share to a player.</p>
      <p>
        {currentOffer ? (
          <>
            You can't offer to share with anybody until you withdraw your
            existing offer to {players[currentOffer.offeredPlayerId].name}.
          </>
        ) : (
          <>You have no offer pending.</>
        )}
      </p>
      <PlayerDropdown
        disabled={!!currentOffer?.offeredPlayerId}
        filter={(playerToCheck) =>
          isPlayerInCurrentRoom(playerToCheck) &&
          playerToCheck.socketId !== player.socketId
        }
        onPlayerSelect={(id) => {
          setUncontrolledPlayerId(id);
          onPlayerSelect && onPlayerSelect(id);
        }}
        players={players}
        selectedPlayerId={currentOffer?.offeredPlayerId ?? selectedPlayerId}
      />
      <Button
        disabled={!!currentOffer?.offeredPlayerId || !selectedPlayerId}
        fluid
        primary
        onClick={() =>
          selectedPlayerId &&
          onOfferShare(
            currentRoom,
            selectedPlayerId,
            PlayerActionType.CARD_SHARE_OFFERED
          )
        }
      >
        Offer card share
      </Button>
      {colorSharing && (
        <Button
          disabled={!!currentOffer?.offeredPlayerId || !selectedPlayerId}
          fluid
          secondary
          onClick={() =>
            selectedPlayerId &&
            onOfferShare(
              currentRoom,
              selectedPlayerId,
              PlayerActionType.COLOR_SHARE_OFFERED
            )
          }
        >
          Offer color share
        </Button>
      )}
    </>
  );
}

export default PlayerShareOffer;
