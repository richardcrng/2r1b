import { Game, Player } from "../../types/game.types";
import useSocketListener from "../../hooks/useSocketListener";
import { ClientEvent, ServerEvent } from "../../types/event.types";
import { toast } from "react-toastify";
import {
  isPlayerCardShareRecord,
  isPlayerColorShareRecord,
  PlayerActionType,
} from "../../types/player-action.types";
import { Button } from "semantic-ui-react";
import { useSocket } from "../../socket";
import { useRef } from "react";
import RoleCard from "../role/card/RoleCard";
import { getRoleDefinition } from "../../utils/role-utils";
import { getTeamColorHex } from "../../utils/colors";

function usePlayerActions(game: Game, player: Player): void {
  const socket = useSocket();

  const toastIds = useRef<Record<string, React.ReactText>>({});

  useSocketListener(ServerEvent.ACTION_PENDING, (playerId, action) => {
    if (player.socketId !== playerId) return;

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
                onClick={() => {
                  toast.dismiss(toastId);
                  socket.emit(
                    ClientEvent.WITHDRAW_ABDICATION_OFFER,
                    game.id,
                    action
                  );
                }}
              >
                Withdraw offer
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
        } else if (playerId === action.proposedNewLeaderId) {
          const toastId = toast(
            <div>
              <p>
                You have been offered the room leadership by{" "}
                {game.players[action.abdicatingLeaderId].name}.
              </p>
              <Button
                color="green"
                onClick={() => {
                  toast.dismiss(toastId);
                  socket.emit(ClientEvent.ACCEPT_ABDICATION, game.id, action);
                }}
              >
                Accept
              </Button>
              <Button
                color="red"
                onClick={() => {
                  toast.dismiss(toastId);
                  socket.emit(ClientEvent.DECLINE_ABDICATION, game.id, action);
                }}
              >
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

        break;

      case PlayerActionType.CARD_SHARE_OFFERED:
      case PlayerActionType.COLOR_SHARE_OFFERED:
        {
          // using a block to avoid lexical scope
          const shareType =
            action.type === PlayerActionType.CARD_SHARE_OFFERED
              ? "card"
              : "color";

          if (playerId === action.sharerId) {
            const offeredPlayerName = game.players[action.offeredPlayerId].name;

            const toastId = toast(
              <div>
                <p>
                  You have offered a <strong>{shareType} share</strong> with{" "}
                  {offeredPlayerName}.
                </p>
                <p>Waiting for them to accept the offer...</p>
                <Button
                  color="red"
                  onClick={() => {
                    toast.dismiss(toastId);
                    socket.emit(
                      ClientEvent.WITHDRAW_SHARE_OFFER,
                      game.id,
                      action
                    );
                  }}
                >
                  Withdraw offer
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
          } else if (playerId === action.offeredPlayerId) {
            const toastId = toast(
              <div>
                <p>
                  You have been offered a <strong>{shareType} share</strong>{" "}
                  with {game.players[action.sharerId].name}.
                </p>
                <Button
                  color="green"
                  onClick={() => {
                    toast.dismiss(toastId);
                    socket.emit(ClientEvent.ACCEPT_SHARE, game.id, action);
                  }}
                >
                  Accept
                </Button>
                <Button
                  color="red"
                  onClick={() => {
                    toast.dismiss(toastId);
                    socket.emit(ClientEvent.DECLINE_SHARE, game.id, action);
                  }}
                >
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

        break;

      case PlayerActionType.SHARE_RESULT_RECEIVED: {
        // using a block to avoid lexical scope
        const shareRecord = action.record;

        if (isPlayerCardShareRecord(shareRecord)) {
          const toastId = toast(
            <div>
              <p>
                You are <strong>card sharing</strong> with{" "}
                {game.players[shareRecord.playerIdSharedWith].name} - you are
                seeing their role below, and they are seeing yours.
              </p>
              <RoleCard
                role={getRoleDefinition(shareRecord.sharedWithPlayer)}
              />
              <Button
                color="red"
                fluid
                onClick={() => {
                  toast.dismiss(toastId);
                  socket.emit(ClientEvent.TERMINATE_SHARE, game.id, action);
                }}
                style={{ marginTop: "5px" }}
              >
                End share
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
        } else if (isPlayerColorShareRecord(shareRecord)) {
          const otherPlayer = game.players[shareRecord.playerIdSharedWith];
          const otherColor = shareRecord.sharedWithPlayer;

          const toastId = toast(
            <div>
              <p>
                You are <strong>color sharing</strong> with {otherPlayer.name} -
                you are seeing their color below, and they are seeing yours.
              </p>
              <p style={{ fontWeight: "bold", fontSize: "120%" }}>
                {otherPlayer.name}'s card color is{" "}
                <strong style={{ color: getTeamColorHex(otherColor).primary }}>
                  {otherColor}
                </strong>
              </p>
              <Button
                color="black"
                fluid
                onClick={() => {
                  toast.dismiss(toastId);
                  socket.emit(ClientEvent.TERMINATE_SHARE, game.id, action);
                }}
                style={{ marginTop: "5px" }}
              >
                End share
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
    }
  });

  useSocketListener(ServerEvent.ACTION_RESOLVED, (playerId, action) => {
    if (playerId !== player.socketId) return;

    const toastIdToDismiss = toastIds.current[action.id];
    toast.dismiss(toastIdToDismiss);
  });
}

export default usePlayerActions;
