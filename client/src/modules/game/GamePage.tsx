import {
  selectCurrentGameRoomAllocation,
  selectCurrentRoomCurrentLeaders,
  selectGamePlayersWithRooms,
} from "../../selectors/game-selectors";
import {
  GamblerPrediction,
  Game,
  GameSettings,
  GameStatus,
  Player,
  RoomName,
} from "../../types/game.types";
import {
  PlayerActionAbdicationOffered,
  PlayerActionShareOfferedType,
} from "../../types/player-action.types";
import { RoleKey } from "../../types/role.types";
import GameEndgame from "./endgame/GameEndgame";
import GameLobby from "./lobby/GameLobby";
import GameOngoing from "./ongoing/GameOngoing";
import GameResults from "./results/GameResults";

interface Props extends GameHandlers {
  game: Game;
  players: Player[];
  player: Player;
}

export interface GameHandlers {
  onAppointLeader(appointedLeaderId: string, currentRoom: RoomName): void;
  onGamblerPrediction(prediction: GamblerPrediction): void;
  onGameStart(): void;
  onGameReset(): void;
  onHostageSelect(
    playerId: string,
    roomName: RoomName,
    isDeselect?: boolean
  ): void;
  onHostageSubmit(roomName: RoomName): void;
  onOfferAbdication: (roomName: RoomName, proposedLeaderId: string) => void;
  onOfferShare(
    roomName: RoomName,
    offeredPlayerId: string,
    shareType: PlayerActionShareOfferedType
  ): void;
  onPlayerKick(playerIdToKick: string): void;
  onPrivateEyeRolePrediction(roleKey: RoleKey): void;
  onProposeLeader(
    proposedLeaderId: string | undefined,
    currentRoom: RoomName
  ): void;
  onResultsReveal(): void;
  onRoleIncrement: (roleKey: RoleKey, increment: number) => void;
  onSettingsUpdate(newSettings: Partial<GameSettings>): void;
  onSniperShot(playerIdShot: string): void;
  onWithdrawAbdicationOffer(action: PlayerActionAbdicationOffered): void;
}

function GamePage({
  game,
  onAppointLeader,
  onGamblerPrediction,
  onGameReset,
  onGameStart,
  onHostageSelect,
  onHostageSubmit,
  onOfferAbdication,
  onOfferShare,
  onPlayerKick,
  onPrivateEyeRolePrediction,
  onProposeLeader,
  onResultsReveal,
  onRoleIncrement,
  onSettingsUpdate,
  onSniperShot,
  onWithdrawAbdicationOffer,
  players,
  player,
}: Props): JSX.Element {
  const currentRooms = selectCurrentGameRoomAllocation(game);
  const currentRoom = currentRooms && currentRooms[player.socketId];

  const currentLeaders = selectCurrentRoomCurrentLeaders(game);

  const leaderIdInThisRoom = currentRoom && currentLeaders[currentRoom];
  const currentLeader = leaderIdInThisRoom
    ? game.players[leaderIdInThisRoom]
    : undefined;

  const playersWithRooms = selectGamePlayersWithRooms(game);

  if (game.status === GameStatus.LOBBY) {
    return (
      <GameLobby
        {...{
          game,
          onGameStart,
          onPlayerKick,
          onRoleIncrement,
          onSettingsUpdate,
          players,
          player,
        }}
      />
    );
  } else if (game.status === GameStatus.ONGOING && currentRoom) {
    return (
      <GameOngoing
        {...{
          currentLeader,
          currentRoom,
          game,
          player,
          players: playersWithRooms,
          onAppointLeader,
          onHostageSelect,
          onHostageSubmit,
          onOfferAbdication,
          onOfferShare,
          onProposeLeader,
          onWithdrawAbdicationOffer,
        }}
      />
    );
  } else if (game.status === GameStatus.ONGOING) {
    return <p>Waiting for room allocation...</p>;
  } else if (game.status === GameStatus.ENDGAME) {
    return (
      <GameEndgame
        {...{
          game,
          onGamblerPrediction,
          onPrivateEyeRolePrediction,
          onResultsReveal,
          onSniperShot,
          player,
        }}
      />
    );
  } else if (game.status === GameStatus.RESULTS) {
    return <GameResults {...{ game, onGameReset, player }} />;
  } else if (game.status === GameStatus.COMPLETE) {
    return <p>Game is complete!</p>;
  } else {
    return <p>Something weird has happened</p>;
  }
}

export default GamePage;
