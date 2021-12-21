import { Redirect, useParams } from "react-router-dom";
import PlayerNamer from "../lib/atoms/PlayerNamer";
import GamePage from "../modules/game/GamePage";
import useGame from "../hooks/useGame";
import usePlayer from "../hooks/usePlayer";
import useSocketAliases from "../hooks/useSocketAliases";
import { useSocket } from "../socket";
import { ClientEvent } from "../types/event.types";
import { GameStatus } from "../types/game.types";

function GameRoute(): JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useSocket();
  const socketAliases = useSocketAliases();

  const game = useGame(gameId);
  const player = usePlayer(socket.id, socketAliases);

  const takenNames = Object.values(game.data?.players ?? {}).map(
    (player) => player.name ?? player.socketId
  );

  if (game.loading) {
    return <p>Loading...</p>;
  } else if (game.error) {
    return <Redirect to="/" />;
  } else if (game.data?.status === GameStatus.ONGOING && !player.data) {
    return <p>Can't join a game that is underway - sorry</p>;
  } else if (!player.loading && !player.data?.name) {
    return (
      <>
        <p>
          To {player.data?.isHost ? "host" : "join"} the game, please choose a
          player name first:
        </p>
        <PlayerNamer
          handleSetName={(name) => {
            if (player.data) {
              // player is in game, so update
              socket.emit(ClientEvent.UPDATE_PLAYER, gameId, {
                socketId: socket.id,
                name,
                gameId,
                conditions: {
                  shareRecords: [],
                },
                pendingActions: {},
              });
            } else {
              // player not in game, so join
              socket.emit(ClientEvent.JOIN_GAME, gameId, {
                socketId: socket.id,
                name,
                gameId,
                conditions: {
                  shareRecords: [],
                },
                pendingActions: {},
              });
            }
          }}
          takenNames={takenNames}
        />
      </>
    );
  } else {
    return (
      <>
        {game.loading && <p>Loading...</p>}
        {game.data && player.data && (
          <GamePage
            game={game.data}
            onAppointLeader={(leaderId, currentRoom) => {
              game.data &&
                player.data &&
                socket.emit(
                  ClientEvent.APPOINT_ROOM_LEADER,
                  game.data.id,
                  currentRoom,
                  player.data.socketId,
                  leaderId
                );
            }}
            onGamblerPrediction={(prediction) => {
              game.data &&
                socket.emit(
                  ClientEvent.GAMBLER_PREDICT,
                  game.data.id,
                  prediction
                );
            }}
            onGameReset={() => {
              game.data && socket.emit(ClientEvent.RESET_GAME, game.data.id);
            }}
            onGameStart={() => {
              game.data && socket.emit(ClientEvent.START_GAME, game.data.id);
            }}
            onHostageSelect={(playerId, roomName, isDeselect = false) => {
              if (isDeselect) {
                game.data &&
                  socket.emit(
                    ClientEvent.DESELECT_HOSTAGE,
                    game.data.id,
                    playerId,
                    roomName
                  );
              } else {
                game.data &&
                  socket.emit(
                    ClientEvent.SELECT_HOSTAGE,
                    game.data.id,
                    playerId,
                    roomName
                  );
              }
            }}
            onHostageSubmit={(roomName) => {
              game.data &&
                socket.emit(
                  ClientEvent.SUBMIT_HOSTAGES,
                  game.data.id,
                  roomName
                );
            }}
            onOfferAbdication={(roomName, proposedLeaderId) => {
              game.data &&
                player.data &&
                socket.emit(
                  ClientEvent.OFFER_ABDICATION,
                  game.data.id,
                  roomName,
                  player.data.socketId,
                  proposedLeaderId
                );
            }}
            onOfferShare={(room, offeredPlayerId, shareType) => {
              game.data &&
                player.data &&
                socket.emit(ClientEvent.OFFER_SHARE, game.data.id, {
                  id: `${ClientEvent.OFFER_SHARE}-${Date.now()}-${
                    player.data.socketId
                  }`,
                  type: shareType,
                  room,
                  sharerId: player.data.socketId,
                  offeredPlayerId,
                });
            }}
            onPlayerKick={(playerId) => {
              game.data &&
                socket.emit(ClientEvent.KICK_PLAYER, game.data.id, playerId);
            }}
            onPrivateEyeRolePrediction={(roleKey) => {
              game.data &&
                socket.emit(
                  ClientEvent.PRIVATE_EYE_PREDICT,
                  game.data.id,
                  roleKey
                );
            }}
            onProposeLeader={(leaderId, currentRoom) => {
              game.data &&
                player.data &&
                socket.emit(
                  ClientEvent.PROPOSE_ROOM_LEADER,
                  game.data.id,
                  currentRoom,
                  player.data.socketId,
                  leaderId
                );
            }}
            onResultsReveal={() => {
              game.data &&
                socket.emit(ClientEvent.REVEAL_RESULTS, game.data.id);
            }}
            onRoleIncrement={(roleKey, increment) => {
              game.data &&
                socket.emit(
                  ClientEvent.INCREMENT_ROLE,
                  game.data.id,
                  roleKey,
                  increment
                );
            }}
            onSettingsUpdate={(newSettings) => {
              game.data &&
                socket.emit(
                  ClientEvent.UPDATE_GAME_SETTINGS,
                  game.data.id,
                  newSettings
                );
            }}
            onSniperShot={(targetPlayerId) => {
              game.data &&
                socket.emit(
                  ClientEvent.SNIPER_SHOT,
                  game.data.id,
                  targetPlayerId
                );
            }}
            onWithdrawAbdicationOffer={(action) => {
              game.data &&
                socket.emit(
                  ClientEvent.WITHDRAW_ABDICATION_OFFER,
                  game.data.id,
                  action
                );
            }}
            players={Object.values(game.data.players)}
            player={player.data}
          />
        )}
      </>
    );
  }
}

export default GameRoute;
