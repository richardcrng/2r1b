import { Redirect, useParams } from "react-router-dom";
import PlayerNamer from "../lib/atoms/PlayerNamer";
import GamePage from "../modules/game/GamePage";
import useGame from "../hooks/useGame";
import usePlayer from "../hooks/usePlayer";
import useSocketAliases from "../hooks/useSocketAliases";
import { useSocket } from "../socket";
import { ClientEvent } from "../types/event.types";
import { GameStatus } from "../types/game.types";

function GameRoute() {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useSocket();
  const socketAliases = useSocketAliases();

  const game = useGame(gameId);
  const player = usePlayer(socket.id, socketAliases);

  const takenNames = Object.values(game.data?.players ?? {}).map(
    (player) => player.name!
  );

  if (game.loading) {
    return <p>Loading...</p>
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
                  shareRecords: []
                },
                pendingActions: {}
              });
            } else {
              // player not in game, so join
              socket.emit(ClientEvent.JOIN_GAME, gameId, {
                socketId: socket.id,
                name,
                gameId,
                conditions: {
                  shareRecords: []
                },
                pendingActions: {}
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
              socket.emit(
                ClientEvent.APPOINT_ROOM_LEADER,
                game.data!.id,
                currentRoom,
                player.data!.socketId,
                leaderId
              );
            }}
            onGamblerPrediction={(prediction) => {
              socket.emit(ClientEvent.GAMBLER_PREDICT, game.data!.id, prediction);
            }}
            onGameStart={() => {
              socket.emit(ClientEvent.START_GAME, game.data!.id);
            }}
            onHostageSelect={(playerId, roomName, isDeselect = false) => {
              if (isDeselect) {
                socket.emit(
                  ClientEvent.DESELECT_HOSTAGE,
                  game.data!.id,
                  playerId,
                  roomName
                );

              } else {
                socket.emit(ClientEvent.SELECT_HOSTAGE, game.data!.id, playerId, roomName)
              }
            }}
            onHostageSubmit={(roomName) => {
              socket.emit(ClientEvent.SUBMIT_HOSTAGES, game.data!.id, roomName)
            }}
            onOfferAbdication={(roomName, proposedLeaderId) => {
              socket.emit(ClientEvent.OFFER_ABDICATION, game.data!.id, roomName, player.data!.socketId, proposedLeaderId)
            }}
            onOfferShare={(room, offeredPlayerId, shareType) => {
              socket.emit(ClientEvent.OFFER_SHARE, game.data!.id, {
                id: `${ClientEvent.OFFER_SHARE}-${Date.now()}-${player.data!.socketId}`,
                type: shareType,
                room,
                sharerId: player.data!.socketId,
                offeredPlayerId
              })
            }}
            onProposeLeader={(leaderId, currentRoom) => {
              socket.emit(
                ClientEvent.PROPOSE_ROOM_LEADER,
                game.data!.id,
                currentRoom,
                player.data!.socketId,
                leaderId
              );
            }}
            onRoleIncrement={(roleKey, increment) => {
              socket.emit(
                ClientEvent.INCREMENT_ROLE,
                game.data!.id,
                roleKey,
                increment
              );
            }}
            onWithdrawAbdicationOffer={(action) => {
              socket.emit(
                ClientEvent.WITHDRAW_ABDICATION_OFFER,
                game.data!.id,
                action
              )
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
