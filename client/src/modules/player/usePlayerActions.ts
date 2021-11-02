import { Game, Player } from "../../types/game.types";
import useSocketListener from '../../hooks/useSocketListener';
import { ServerEvent } from "../../types/event.types";
import { toast } from 'react-toastify';
import { PlayerActionType } from "../../types/player-action.types";


function usePlayerActions(game: Game, player: Player): void {
  useSocketListener(ServerEvent.ACTION_PENDING, (playerId, action) => {
    console.log('received pending action', playerId, player, action)

    if (player.socketId !== playerId) return

    switch (action.type) {

      case PlayerActionType.ABDICATION_OFFERED:
        if (playerId === action.abdicatingLeaderId) {
          toast(`You have offered the room leadership to ${game.players[action.proposedNewLeaderId].name}.`)
        } else if (playerId === action.proposedNewLeaderId) {
          toast(`You have been offered the room leadership by ${game.players[action.abdicatingLeaderId].name}.`)
        }

    }
  })
}

export default usePlayerActions