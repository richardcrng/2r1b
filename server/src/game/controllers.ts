import { ClientEvent, ClientEventListeners } from "../../../client/src/types/event.types";
import {
  GameStatus,
  LeaderRecordMethod,
  RoomName,
  RoundStatus,
} from "../../../client/src/types/game.types";
import { RoleKey } from '../../../client/src/types/role.types';
import { GameManager } from "./model";
import { NotificationType } from "../../../client/src/types/notification.types";
import { PlayerActionAbdicationOffered, PlayerActionType } from "../../../client/src/types/player-action.types";

export const acceptAbdication: ClientEventListeners[ClientEvent.ACCEPT_ABDICATION] = (gameId, action): void => {
  const gameManager = new GameManager(gameId);
  const { abdicatingLeaderId, proposedNewLeaderId } = action;
  const abdicaterName = gameManager.getPlayerOrFail(abdicatingLeaderId).name
  const newLeaderName = gameManager.getPlayerOrFail(proposedNewLeaderId).name

  gameManager.addLeaderRecord(action.room, {
    method: LeaderRecordMethod.ABDICATION,
    leaderId: proposedNewLeaderId,
    abdicaterId: abdicatingLeaderId
  });

  gameManager.managePlayer(proposedNewLeaderId).resolvePendingAction(action, {
    type: NotificationType.GENERAL,
    message: `${abdicaterName} has abdicated room leadership to you`,
  });

  gameManager.managePlayer(abdicatingLeaderId).resolvePendingAction(action, {
    type: NotificationType.GENERAL,
    message: `You have abdicated room leadership to ${newLeaderName}`
  });

  gameManager.pushPlayerNotificationToRoom(action.room, {
    type: NotificationType.GENERAL,
    message: `${abdicaterName} has abdicated room leadership to ${newLeaderName}`
  }, (player) => ![abdicatingLeaderId, proposedNewLeaderId].includes(player.socketId))
}

export const acceptShare: ClientEventListeners[ClientEvent.ACCEPT_SHARE] =
  (gameId, action): void => {
    const gameManager = new GameManager(gameId);
    gameManager.resolveShare(action);
  };

export const appointLeader: ClientEventListeners[ClientEvent.APPOINT_ROOM_LEADER] = (gameId: string, roomName: RoomName, appointerId: string, appointedLeaderId: string): void => {
  const gameManager = new GameManager(gameId);
  const targetRoom = gameManager.currentRound().round.rooms[roomName];

  if (targetRoom.leadersRecord.length === 0) {
    gameManager.addLeaderRecord(roomName, {
      method: LeaderRecordMethod.APPOINTMENT,
      leaderId: appointedLeaderId,
      appointerId,
    });

    gameManager.pushPlayerNotificationToRoom(roomName, (player) => {
      const newLeaderName = gameManager.getPlayerOrFail(appointedLeaderId).name;
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
    })
  }
}

export const declineAbdication: ClientEventListeners[ClientEvent.DECLINE_ABDICATION] =
  (gameId, action): void => {
    const gameManager = new GameManager(gameId);
    const { abdicatingLeaderId, proposedNewLeaderId } = action;
    const abdicaterName = gameManager.getPlayerOrFail(abdicatingLeaderId).name;
    const proposedLeaderName = gameManager.getPlayerOrFail(proposedNewLeaderId).name;

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
  const gameManager = new GameManager(gameId);
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

export const incrementRoleInGame: ClientEventListeners[ClientEvent.INCREMENT_ROLE] = (
  gameId: string,
  role: RoleKey,
  increment: number
): void => {
  new GameManager(gameId).update(game => {
    game.rolesCount[role] += increment;
  })
};

export const offerAbdication: ClientEventListeners[ClientEvent.OFFER_ABDICATION] = (
  gameId,
  room,
  abdicatingLeaderId,
  proposedNewLeaderId
) => {
  const gameManager = new GameManager(gameId);
  const abdicationOffer: PlayerActionAbdicationOffered = {
    id: `${Date.now()}-${Math.random().toFixed(5).slice(2)}`,
    room,
    type: PlayerActionType.ABDICATION_OFFERED,
    abdicatingLeaderId,
    proposedNewLeaderId
  }

  for (let playerId of [abdicatingLeaderId, proposedNewLeaderId]) {
    const playerManager = gameManager.managePlayer(playerId);
    playerManager.update((player) => {
      player.pendingActions[abdicationOffer.id] = abdicationOffer;
    });
    playerManager.pushPendingAction(abdicationOffer)
  }
}

export const offerShare: ClientEventListeners[ClientEvent.OFFER_SHARE] = (gameId, action): void => {
  const gameManager = new GameManager(gameId);

  for (let playerId of [action.sharerId, action.offeredPlayerId]) {
    const playerManager = gameManager.managePlayer(playerId);
    playerManager.update((player) => {
      player.pendingActions[action.id] = action;
    });
    playerManager.pushPendingAction(action);
  }
}

export const proposeRoomLeader: ClientEventListeners[ClientEvent.PROPOSE_ROOM_LEADER] = (
  gameId: string,
  roomName: RoomName,
  voterId: string,
  proposedLeaderId?: string
): void => {
  const gameManager = new GameManager(gameId);

  const currentLeader = gameManager.currentLeaderRecord(roomName)!.leaderId

  gameManager.updatePlayer(voterId, (player) => {
    if (proposedLeaderId && proposedLeaderId !== currentLeader) {
      player.leaderVote = {
        roomName,
        voterId,
        proposedLeaderId,
        timestamp: Date.now(),
      };
    } else {
      delete player.leaderVote
    }
  });

  if (proposedLeaderId) {
    const playersInThisRoom = gameManager.playersInRoom(roomName);
    const votesForLeader = gameManager.votesAgainstPlayer(proposedLeaderId);

    if (votesForLeader.length > Object.keys(playersInThisRoom).length / 2) {
      usurpLeader(gameId, roomName, proposedLeaderId, currentLeader, votesForLeader.map(vote => vote.voterId));
    }
  }
}

export const startGame: ClientEventListeners[ClientEvent.START_GAME] = (
  gameId: string,
): void => {
  const gameManager = new GameManager(gameId);
  gameManager.assignInitialRoles();
  gameManager.assignInitialRooms();
  gameManager.update(game => {
    game.status = GameStatus.ONGOING;
    game.rounds[0].status = RoundStatus.ONGOING;
    game.currentTimerSeconds = game.rounds[0].timerSeconds;
  });
  gameManager.startTimer();
  gameManager.pushPlayersNotification((player) => ({
    type: NotificationType.GENERAL,
    message: `⏳ Head to Room ${gameManager.getCurrentRoomFor(
      player.socketId
    )} - the round has started!`,
  }));
};

const usurpLeader = (
  gameId: string,
  roomName: RoomName,
  newLeaderId: string,
  oldLeaderId: string,
  voterIds: string[]
): void => {
  const gameManager = new GameManager(gameId);

  gameManager.addLeaderRecord(roomName, {
    method: LeaderRecordMethod.USURPATION,
    leaderId: newLeaderId,
    votes: Object.fromEntries(voterIds.map((id) => [id, 1])),
  });

  for (let voterId of voterIds) {
    gameManager.updatePlayer(voterId, (player) => {
      delete player.leaderVote;
    });
  }

  gameManager.pushPlayerNotificationToRoom(roomName, (player) => {
    const oldLeaderName = gameManager.getPlayerOrFail(oldLeaderId).name;
    const newLeaderName = gameManager.getPlayerOrFail(newLeaderId).name;

    const message = player.socketId === newLeaderId
      ? `You have usurped ${oldLeaderName} as leader`
      : player.socketId === oldLeaderId
        ? `${newLeaderName} has usurped you as leader`
        : `${newLeaderName} has usurped ${oldLeaderName} as leader`

    return {
      type: NotificationType.GENERAL,
      message,
    };
  });
};


export const withdrawAbdicationOffer: ClientEventListeners[ClientEvent.WITHDRAW_ABDICATION_OFFER] = (gameId, offer) => {
  const gameManager = new GameManager(gameId);

  const abdicatingPlayerName = gameManager.getPlayerOrFail(offer.abdicatingLeaderId).name
  const offeredPlayerName = gameManager.getPlayerOrFail(
    offer.proposedNewLeaderId
  ).name;

  gameManager.managePlayer(offer.abdicatingLeaderId).resolvePendingAction(offer, {
    type: NotificationType.GENERAL,
    message: `You have withdrawn your abdication offer to ${offeredPlayerName}`
  })

  gameManager
    .managePlayer(offer.proposedNewLeaderId)
    .resolvePendingAction(offer, {
      type: NotificationType.GENERAL,
      message: `${abdicatingPlayerName} has withdrawn their abdication offer to you`,
    });
}

export const withdrawShareOffer: ClientEventListeners[ClientEvent.WITHDRAW_SHARE_OFFER] = (
  gameId,
  action
): void => {
  const gameManager = new GameManager(gameId);
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