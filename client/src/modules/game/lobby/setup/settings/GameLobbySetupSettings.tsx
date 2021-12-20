import { Checkbox } from "semantic-ui-react";
import { GameSettings } from "../../../../../types/game.types";
import { GameHandlers } from "../../../GamePage";

interface Props {
  isEditable?: boolean;
  onSettingsUpdate: GameHandlers["onSettingsUpdate"];
  settings: GameSettings;
}

function GameLobbySetupSettings({
  isEditable,
  onSettingsUpdate,
  settings,
}: Props): JSX.Element {
  return (
    <>
      <Checkbox
        checked={settings.colorSharing}
        label={{
          children: (
            <>
              <strong>Color sharing:</strong>{" "}
              {settings.colorSharing ? "ON" : "OFF"}
            </>
          ),
        }}
        onChange={() =>
          isEditable &&
          onSettingsUpdate({ colorSharing: !settings.colorSharing })
        }
        toggle
      />
    </>
  );
}

export default GameLobbySetupSettings;
