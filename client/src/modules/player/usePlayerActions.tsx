import { Game, Player } from "../../types/game.types";
import useSocketListener from '../../hooks/useSocketListener';
import { ServerEvent } from "../../types/event.types";
import { toast } from 'react-toastify';
import { PlayerActionType } from "../../types/player-action.types";
import { Button } from 'semantic-ui-react';
import { useSocket } from "../../socket";


function usePlayerActions(game: Game, player: Player): void {
  const socket = useSocket()

  useSocketListener(ServerEvent.ACTION_PENDING, (playerId, action) => {
    if (player.socketId !== playerId) return

    switch (action.type) {

      case PlayerActionType.ABDICATION_OFFERED:
        if (playerId === action.abdicatingLeaderId) {
          const proposedLeaderName =
            game.players[action.proposedNewLeaderId].name;
          
          const toastId = toast(
            <div>
              <p>
                You have offered the room leadership to {proposedLeaderName}.
              </p>
              <p>Waiting for them to accept the offer...</p>
              <Button
                color="red"
                onClick={() => toast.dismiss(toastId)}
              >Withdraw offer</Button>
            </div>,
            {
              autoClose: false,
              closeButton: false,
              closeOnClick: false,
              draggable: false,
            }
          );

        } else if (playerId === action.proposedNewLeaderId) {
          
          const toastId = toast(
            <div>
              <p>
                You have been offered the room leadership by{" "}
                {game.players[action.abdicatingLeaderId].name}.
              </p>
              <Button color="green" onClick={() => toast.dismiss(toastId)}>
                Accept
              </Button>
              <Button color="red" onClick={() => toast.dismiss(toastId)}>
                Reject
              </Button>
            </div>,
            {
              autoClose: false,
              closeButton: false,
              closeOnClick: false,
              draggable: false,
            }
          );
        }

    }
  })
}

export default usePlayerActions