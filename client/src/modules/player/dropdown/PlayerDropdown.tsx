import { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { Player } from "../../../types/game.types";

interface Props {
  filter?(player: Player): boolean;
  onPlayerSelect?(playerId: string): void;
  players: Record<string, Player>;
  selectedPlayerId?: string;
}

function PlayerDropdown({
  filter,
  onPlayerSelect,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props) {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<string>();
  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const playerValues = Object.values(players);

  const optionsToList = filter
    ? playerValues.filter(filter)
    : playerValues;

  const dropdownOptions = optionsToList
    .map((player) => ({
      key: player.socketId,
      text: player.name!,
      value: player.socketId,
    }))
    .sort((a, b) => (a.text < b.text ? -1 : 0));

  return (
    <Dropdown
      search
      selection
      fluid
      options={dropdownOptions}
      value={selectedPlayerId}
      onChange={(_, { value }) => {
        const newId = value as string
        onPlayerSelect && onPlayerSelect(newId);
        setUncontrolledPlayerId(newId);
      }}
    />
  );
}

export default PlayerDropdown;
