import {
  ClientEvent,
  ClientEventListeners,
  ServerEvent,
} from "../../../client/src/types/event.types";
import {
  GameStatus,
  LeaderRecordMethod,
  RoomName,
  RoundStatus,
} from "../../../client/src/types/game.types";
import { RoleKey } from "../../../client/src/types/role.types";
import { GameManager } from "./model";
import { NotificationType } from "../../../client/src/types/notification.types";
import {
  PlayerActionAbdicationOffered,
  PlayerActionType,
} from "../../../client/src/types/player-action.types";

export const acceptAbdication: ClientEventListeners[ClientEvent.ACCEPT_ABDICATION] =
  (gameId, action): void => {
    const gameManager = GameManager.for(gameId);
    const { abdicatingLeaderId, proposedNewLeaderId } = action;
    const abdicaterName = gameManager.getPlayerOrFail(abdicatingLeaderId).name;
    const newLeaderName = gameManager.getPlayerOrFail(proposedNewLeaderId).name;

    gameManager.addLeaderRecord(action.room, {
      method: LeaderRecordMethod.ABDICATION,
      leaderId: proposedNewLeaderId,
      abdicaterId: abdicatingLeaderId,
    });

    gameManager.managePlayer(proposedNewLeaderId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `${abdicaterName} has abdicated room leadership to you`,
    });

    gameManager.managePlayer(abdicatingLeaderId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `You have abdicated room leadership to ${newLeaderName}`,
    });

    gameManager.pushPlayerNotificationToRoom(
      action.room,
      {
        type: NotificationType.GENERAL,
        message: `${abdicaterName} has abdicated room leadership to ${newLeaderName}`,
      },
      (player) =>
        ![abdicatingLeaderId, proposedNewLeaderId].includes(player.socketId)
    );
  };

export const acceptShare: ClientEventListeners[ClientEvent.ACCEPT_SHARE] = (
  gameId,
  action
): void => {
  const gameManager = GameManager.for(gameId);
  gameManager.resolveAcceptedShare(action);
};

export const appointLeader: ClientEventListeners[ClientEvent.APPOINT_ROOM_LEADER] =
  (
    gameId: string,
    roomName: RoomName,
    appointerId: string,
    appointedLeaderId: string
  ): void => {
    const gameManager = GameManager.for(gameId);
    const targetRoom = gameManager.currentRound().rooms[roomName];

    if (targetRoom.leadersRecord.length === 0) {
      gameManager.addLeaderRecord(roomName, {
        method: LeaderRecordMethod.APPOINTMENT,
        leaderId: appointedLeaderId,
        appointerId,
      });

      gameManager.pushPlayerNotificationToRoom(roomName, (player) => {
        const newLeaderName =
          gameManager.getPlayerOrFail(appointedLeaderId).name;
        const appointerName = gameManager.getPlayerOrFail(appointerId).name;

        const message =
          player.socketId === appointerId
            ? `You have appointed ${newLeaderName} as leader`
            : player.socketId === appointedLeaderId
            ? `You have been appointed as leader by ${appointerName}`
            : `${newLeaderName} has been appointed as leader by ${appointerName}`;

        return {
          type: NotificationType.GENERAL,
          message,
        };
      });
    }
  };

export const declineAbdication: ClientEventListeners[ClientEvent.DECLINE_ABDICATION] =
  (gameId, action): void => {
    const gameManager = GameManager.for(gameId);
    const { abdicatingLeaderId, proposedNewLeaderId } = action;
    const abdicaterName = gameManager.getPlayerOrFail(abdicatingLeaderId).name;
    const proposedLeaderName =
      gameManager.getPlayerOrFail(proposedNewLeaderId).name;

    gameManager.managePlayer(proposedNewLeaderId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `You have declined the abdication offer of ${abdicaterName}`,
    });

    gameManager.managePlayer(abdicatingLeaderId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `${proposedLeaderName} has declined your abdication offer`,
    });
  };

export const declineShare: ClientEventListeners[ClientEvent.DECLINE_SHARE] = (
  gameId,
  action
): void => {
  const gameManager = GameManager.for(gameId);
  const { sharerId, offeredPlayerId } = action;
  const shareType =
    action.type === PlayerActionType.CARD_SHARE_OFFERED ? "card" : "color";
  const sharerName = gameManager.getPlayerOrFail(sharerId).name;
  const offeredPlayerName = gameManager.getPlayerOrFail(offeredPlayerId).name;

  gameManager.managePlayer(sharerId).resolvePendingAction(action, {
    type: NotificationType.GENERAL,
    message: `${offeredPlayerName} has declined your ${shareType} share offer`,
  });

  gameManager.managePlayer(offeredPlayerId).resolvePendingAction(action, {
    type: NotificationType.GENERAL,
    message: `You have declined ${sharerName}'s ${shareType} share offer`,
  });
};

export const deselectHostage: ClientEventListeners[ClientEvent.DESELECT_HOSTAGE] =
  (gameId, playerId, roomName) => {
    GameManager.for(gameId).updateCurrentRound((round) => {
      round.rooms[roomName].hostages = round.rooms[roomName].hostages.filter(
        (id) => id !== playerId
      );
    });
  };

export const handleGamblerPrediction: ClientEventListeners[ClientEvent.GAMBLER_PREDICT] =
  (gameId, prediction) => {
    const gameManager = GameManager.for(gameId);
    gameManager.update((game) => {
      game.endgame.gamblerPrediction = prediction;
    });
  };

export const handleSniperShot: ClientEventListeners[ClientEvent.SNIPER_SHOT] = (
  gameId,
  sniperShotId
) => {
  GameManager.for(gameId).update((game) => {
    game.endgame.sniperShot = sniperShotId;
  });
};

export const handlePrivateEyePrediction: ClientEventListeners[ClientEvent.PRIVATE_EYE_PREDICT] =
  (gameId, roleKey) => {
    GameManager.for(gameId).update((game) => {
      game.endgame.privateEyePrediction = roleKey;
    });
  };

export const incrementRoleInGame: ClientEventListeners[ClientEvent.INCREMENT_ROLE] =
  (gameId: string, role: RoleKey, increment: number): void => {
    GameManager.for(gameId).update((game) => {
      game.rolesCount[role] += increment;
    });
  };

export const kickPlayer: ClientEventListeners[ClientEvent.KICK_PLAYER] = (
  gameId,
  playerIdToKick
) => {
  const gameManager = GameManager.for(gameId);
  gameManager.io.emit(ServerEvent.PLAYER_KICKED, gameId, playerIdToKick);
  gameManager.update((game) => {
    delete game.players[playerIdToKick];
  });
};

export const offerAbdication: ClientEventListeners[ClientEvent.OFFER_ABDICATION] =
  (gameId, room, abdicatingLeaderId, proposedNewLeaderId) => {
    const gameManager = GameManager.for(gameId);
    const abdicationOffer: PlayerActionAbdicationOffered = {
      id: `${Date.now()}-${Math.random().toFixed(5).slice(2)}`,
      room,
      type: PlayerActionType.ABDICATION_OFFERED,
      abdicatingLeaderId,
      proposedNewLeaderId,
    };

    for (const playerId of [abdicatingLeaderId, proposedNewLeaderId]) {
      const playerManager = gameManager.managePlayer(playerId);
      playerManager.update((player) => {
        player.pendingActions[abdicationOffer.id] = abdicationOffer;
      });
      playerManager.pushPendingAction(abdicationOffer);
    }
  };

export const offerShare: ClientEventListeners[ClientEvent.OFFER_SHARE] = (
  gameId,
  action
): void => {
  const gameManager = GameManager.for(gameId);

  for (const playerId of [action.sharerId, action.offeredPlayerId]) {
    const playerManager = gameManager.managePlayer(playerId);
    playerManager.update((player) => {
      player.pendingActions[action.id] = action;
    });
    playerManager.pushPendingAction(action);
  }
};

export const proposeRoomLeader: ClientEventListeners[ClientEvent.PROPOSE_ROOM_LEADER] =
  (
    gameId: string,
    roomName: RoomName,
    voterId: string,
    proposedLeaderId?: string
  ): void => {
    const gameManager = GameManager.for(gameId);

    const currentLeaderRecord = gameManager.currentLeaderRecord(roomName);
    if (!currentLeaderRecord)
      throw new Error("Can't propose a leader when there is no current leader");
    const currentLeader = currentLeaderRecord.leaderId;

    gameManager.updatePlayer(voterId, (player) => {
      if (proposedLeaderId && proposedLeaderId !== currentLeader) {
        player.leaderVote = {
          roomName,
          voterId,
          proposedLeaderId,
          timestamp: Date.now(),
        };
      } else {
        delete player.leaderVote;
      }
    });

    if (proposedLeaderId) {
      const playersInThisRoom = gameManager.playersInRoom(roomName);
      const votesForLeader = gameManager.votesAgainstPlayer(proposedLeaderId);

      if (votesForLeader.length > Object.keys(playersInThisRoom).length / 2) {
        usurpLeader(
          gameId,
          roomName,
          proposedLeaderId,
          currentLeader,
          votesForLeader.map((vote) => vote.voterId)
        );
      }
    }
  };

export const resetGame: ClientEventListeners[ClientEvent.RESET_GAME] = (
  gameId
) => {
  const gameManager = GameManager.for(gameId);
  gameManager.resetGame();
};

export const revealResults: ClientEventListeners[ClientEvent.REVEAL_RESULTS] = (
  gameId
) => {
  const gameManager = GameManager.for(gameId);
  gameManager.update((game) => {
    game.status = GameStatus.RESULTS;
  });
};

export const selectHostage: ClientEventListeners[ClientEvent.SELECT_HOSTAGE] = (
  gameId,
  playerId,
  roomName
) => {
  GameManager.for(gameId).updateCurrentRound((round) => {
    if (!round.rooms[roomName].hostages.includes(playerId)) {
      round.rooms[roomName].hostages.push(playerId);
    }
  });
};

export const startGame: ClientEventListeners[ClientEvent.START_GAME] = (
  gameId: string
): void => {
  const gameManager = GameManager.for(gameId);
  gameManager.assignInitialRoles();
  gameManager.assignInitialRooms();
  gameManager.update((game) => {
    game.status = GameStatus.ONGOING;
    game.rounds[1].status = RoundStatus.ONGOING;
    game.currentTimerSeconds = game.rounds[1].timerSeconds;
  });
  gameManager.pushPlayersNotification((player) => ({
    type: NotificationType.GENERAL,
    message: `🚪 Head to Room ${gameManager.getCurrentRoomFor(
      player.socketId
    )}`,
  }));
  gameManager.startRoundTimer();
};

export const submitHostages: ClientEventListeners[ClientEvent.SUBMIT_HOSTAGES] =
  (gameId, roomName) => {
    const gameManager = GameManager.for(gameId);
    gameManager.updateCurrentRound((round) => {
      round.rooms[roomName].isReadyToExchange = true;
    });

    const currentRound = gameManager.currentRound();

    if (
      Object.values(currentRound.rooms).every(
        (roomRound) => roomRound.isReadyToExchange
      )
    ) {
      gameManager.exchangeHostages();
    }
  };

export const terminateShare: ClientEventListeners[ClientEvent.TERMINATE_SHARE] =
  (gameId, shareResultAction) => {
    const gameManager = GameManager.for(gameId);

    const cardShareType =
      shareResultAction.record.offerAction.type ===
      PlayerActionType.CARD_SHARE_OFFERED
        ? "card"
        : "color";

    const terminateeId = shareResultAction.record.playerIdSharedWith;
    const terminatorId = [
      shareResultAction.record.offerAction.sharerId,
      shareResultAction.record.offerAction.offeredPlayerId,
    ].find((id) => id !== terminateeId);

    if (!terminatorId) throw new Error("Didn't find a terminator player");

    const terminateeName = gameManager.getPlayerOrFail(terminateeId).name;
    const terminatorName = gameManager.getPlayerOrFail(terminatorId).name;

    gameManager
      .managePlayer(terminateeId)
      .resolvePendingAction(shareResultAction, {
        type: NotificationType.GENERAL,
        message: `${terminatorName} has ended their ${cardShareType} share with you`,
      });

    gameManager
      .managePlayer(terminatorId)
      .resolvePendingAction(shareResultAction, {
        type: NotificationType.GENERAL,
        message: `You have ended your ${cardShareType} share with ${terminateeName}`,
      });
  };

export const updateGameSettings: ClientEventListeners[ClientEvent.UPDATE_GAME_SETTINGS] =
  (gameId, newSettings) => {
    GameManager.for(gameId).update((game) => ({
      ...game,
      settings: Object.assign(game.settings, newSettings),
    }));
  };

const usurpLeader = (
  gameId: string,
  roomName: RoomName,
  newLeaderId: string,
  oldLeaderId: string,
  voterIds: string[]
): void => {
  const gameManager = GameManager.for(gameId);

  gameManager.addLeaderRecord(roomName, {
    method: LeaderRecordMethod.USURPATION,
    leaderId: newLeaderId,
    votes: Object.fromEntries(voterIds.map((id) => [id, 1])),
  });

  for (const voterId of voterIds) {
    gameManager.updatePlayer(voterId, (player) => {
      delete player.leaderVote;
    });
  }

  gameManager.pushPlayerNotificationToRoom(roomName, (player) => {
    const oldLeaderName = gameManager.getPlayerOrFail(oldLeaderId).name;
    const newLeaderName = gameManager.getPlayerOrFail(newLeaderId).name;

    const message =
      player.socketId === newLeaderId
        ? `You have usurped ${oldLeaderName} as leader`
        : player.socketId === oldLeaderId
        ? `${newLeaderName} has usurped you as leader`
        : `${newLeaderName} has usurped ${oldLeaderName} as leader`;

    return {
      type: NotificationType.GENERAL,
      message,
    };
  });
};

export const withdrawAbdicationOffer: ClientEventListeners[ClientEvent.WITHDRAW_ABDICATION_OFFER] =
  (gameId, offer) => {
    const gameManager = GameManager.for(gameId);

    const abdicatingPlayerName = gameManager.getPlayerOrFail(
      offer.abdicatingLeaderId
    ).name;
    const offeredPlayerName = gameManager.getPlayerOrFail(
      offer.proposedNewLeaderId
    ).name;

    gameManager
      .managePlayer(offer.abdicatingLeaderId)
      .resolvePendingAction(offer, {
        type: NotificationType.GENERAL,
        message: `You have withdrawn your abdication offer to ${offeredPlayerName}`,
      });

    gameManager
      .managePlayer(offer.proposedNewLeaderId)
      .resolvePendingAction(offer, {
        type: NotificationType.GENERAL,
        message: `${abdicatingPlayerName} has withdrawn their abdication offer to you`,
      });
  };

export const withdrawShareOffer: ClientEventListeners[ClientEvent.WITHDRAW_SHARE_OFFER] =
  (gameId, action): void => {
    const gameManager = GameManager.for(gameId);
    const { sharerId, offeredPlayerId } = action;
    const shareType =
      action.type === PlayerActionType.CARD_SHARE_OFFERED ? "card" : "color";
    const sharerName = gameManager.getPlayerOrFail(sharerId).name;
    const offeredPlayerName = gameManager.getPlayerOrFail(offeredPlayerId).name;

    gameManager.managePlayer(offeredPlayerId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `${sharerName} has withdrawn their ${shareType} share offer`,
    });

    gameManager.managePlayer(sharerId).resolvePendingAction(action, {
      type: NotificationType.GENERAL,
      message: `You have withdrawn your ${shareType} share offer for ${offeredPlayerName}`,
    });
  };
