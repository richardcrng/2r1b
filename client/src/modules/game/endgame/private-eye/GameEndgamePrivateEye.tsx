import { useState } from "react";
import { Button } from "semantic-ui-react";
import styled from "styled-components";
import { Player, RolesCount } from "../../../../types/game.types";
import { RoleKey } from "../../../../types/role.types";
import RoleDropdown from "../../../role/dropdown/RoleDropdown";

const Container = styled.div``;

interface Props {
  onPrivateEyeRolePrediction(rolePrediction: RoleKey): void;
  player: Player;
  rolesCount: RolesCount;
}

function GameEndgamePrivateEye({
  onPrivateEyeRolePrediction,
  player,
  rolesCount,
}: Props): JSX.Element {
  const [prediction, setPrediction] = useState<RoleKey>();

  return (
    <Container className="active-contents">
      <h1>All rounds are over</h1>
      <h2>Private Eye Prediction</h2>
      {player.role === "PRIVATE_EYE_GREY" ? (
        <>
          <p>
            As the Private Eye, you now need to make a prediction as to which
            role is buried.
          </p>
          <RoleDropdown
            filter={({ key }) =>
              rolesCount[key] >= 1 && key !== "PRIVATE_EYE_GREY"
            }
            onRoleSelect={setPrediction}
            selectedRole={prediction}
          />
          <Button
            color="black"
            disabled={!prediction}
            onClick={() => prediction && onPrivateEyeRolePrediction(prediction)}
          >
            Submit prediction
          </Button>
        </>
      ) : (
        <>
          <p>
            The Private Eye is making a prediction as to which role is buried.
          </p>
        </>
      )}
    </Container>
  );
}

export default GameEndgamePrivateEye;
