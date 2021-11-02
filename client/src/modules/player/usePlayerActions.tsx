import { Game, Player } from "../../types/game.types";
import useSocketListener from '../../hooks/useSocketListener';
import { ClientEvent, ServerEvent } from "../../types/event.types";
import { toast } from 'react-toastify';
import { PlayerActionType } from "../../types/player-action.types";
import { Button } from 'semantic-ui-react';
import { useSocket } from "../../socket";
import { useRef } from "react";


function usePlayerActions(game: Game, player: Player): void {
  const socket = useSocket();

  const toastIds = useRef<Record<string, React.ReactText>>({});

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

          toastIds.current[action.id] = toastId;

        } else if (playerId === action.proposedNewLeaderId) {
          
          const toastId = toast(
            <div>
              <p>
                You have been offered the room leadership by{" "}
                {game.players[action.abdicatingLeaderId].name}.
              </p>
              <Button color="green" onClick={() => {
                toast.dismiss(toastId);
                socket.emit(ClientEvent.ACCEPT_ABDICATION, game.id, action)
              }}>
                Accept
              </Button>
              <Button color="red" onClick={() => {
                toast.dismiss(toastId);
                socket.emit(ClientEvent.DECLINE_ABDICATION, game.id, action)
              }}>
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

          toastIds.current[action.id] = toastId;
        }
    }
  })

  useSocketListener(ServerEvent.ACTION_RESOLVED, (playerId, action) => {
    if (playerId !== player.socketId) return

    switch (action.type) {
      case PlayerActionType.ABDICATION_OFFERED:
        const toastIdToDismiss = toastIds.current[action.id];
        toast.dismiss(toastIdToDismiss);
    }
  })
}

export default usePlayerActions