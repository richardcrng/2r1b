import { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { Player } from "../../../types/game.types";

interface Props {
  disabled?: boolean;
  filter?(player: Player): boolean;
  onPlayerSelect?(playerId: string): void;
  players: Record<string, Player>;
  selectedPlayerId?: string;
}

function PlayerDropdown({
  disabled,
  filter,
  onPlayerSelect,
  players,
  selectedPlayerId: controlledPlayerId,
}: Props): JSX.Element {
  const [uncontrolledPlayerId, setUncontrolledPlayerId] = useState<string>();
  const selectedPlayerId = controlledPlayerId ?? uncontrolledPlayerId;

  const playerValues = Object.values(players);

  const optionsToList = filter ? playerValues.filter(filter) : playerValues;

  const dropdownOptions = optionsToList
    .map((player) => ({
      key: player.socketId,
      text: player.name ?? player.socketId,
      value: player.socketId,
    }))
    .sort((a, b) => (a.text < b.text ? -1 : 0));

  return (
    <Dropdown
      disabled={disabled}
      search
      selection
      fluid
      options={dropdownOptions}
      value={selectedPlayerId}
      onChange={(_, { value }) => {
        const newId = value as string;
        onPlayerSelect && onPlayerSelect(newId);
        setUncontrolledPlayerId(newId);
      }}
    />
  );
}

export default PlayerDropdown;
