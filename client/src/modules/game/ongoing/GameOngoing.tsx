import { selectCurrentGameRound } from "../../../selectors/game-selectors";
import {
  Game,
  Player,
  PlayerWithRoom,
  RoomName,
  RoundStatus,
} from "../../../types/game.types";
import {
  PlayerActionAbdicationOffered,
  PlayerActionShareOfferedType,
} from "../../../types/player-action.types";
import usePlayerActions from "../../player/usePlayerActions";
import GameOngoingDiscussion from "./discussion/GameOngoingDiscussion";
import GameOngoingHostageSelection from "./hostage-selection/GameOngoingHostageSelection";

export interface PlayerGameState {
  modal: {
    isOpen: boolean;
    title?: (props: Props) => string;
    content?: React.FC<Props>;
  };
}

interface Props {
  currentLeader?: Player;
  currentRoom: RoomName;
  game: Game;
  player: Player;
  players: Record<string, PlayerWithRoom>;
  onAppointLeader(appointedLeaderId: string, roomName: RoomName): void;
  onHostageSelect(
    playerId: string,
    roomName: RoomName,
    isDeselect?: boolean
  ): void;
  onHostageSubmit(roomName: RoomName): void;
  onOfferAbdication(roomName: RoomName, proposedLeaderId?: string): void;
  onOfferShare(
    roomName: RoomName,
    playerId: string,
    shareType: PlayerActionShareOfferedType
  ): void;
  onWithdrawAbdicationOffer(action: PlayerActionAbdicationOffered): void;
  onProposeLeader(
    proposedLeaderId: string | undefined,
    roomName: RoomName
  ): void;
}

function GameOngoing({
  currentLeader,
  currentRoom,
  game,
  onAppointLeader,
  onHostageSelect,
  onHostageSubmit,
  onOfferAbdication,
  onOfferShare,
  onWithdrawAbdicationOffer,
  onProposeLeader,
  player,
  players,
}: Props): JSX.Element {
  usePlayerActions(game, player);

  const currentRound = selectCurrentGameRound(game);

  if (!currentLeader || currentRound?.status === RoundStatus.ONGOING) {
    return (
      <GameOngoingDiscussion
        {...{
          currentLeader,
          currentRoom,
          game,
          onAppointLeader,
          onOfferAbdication,
          onOfferShare,
          onWithdrawAbdicationOffer,
          onProposeLeader,
          player,
          players,
        }}
      />
    );
  } else if (
    currentRound?.status === RoundStatus.HOSTAGE_SELECTION &&
    currentLeader
  ) {
    return (
      <GameOngoingHostageSelection
        game={game}
        leaderName={currentLeader.name ?? currentLeader.socketId}
        isLeader={player.socketId === currentLeader.socketId}
        onHostageSelect={onHostageSelect}
        onHostageSubmit={onHostageSubmit}
        player={player}
        players={players}
        roomName={currentRoom}
        round={currentRound}
      />
    );
  } else {
    return <p>Oops, something weird happened</p>;
  }
}

export default GameOngoing;
