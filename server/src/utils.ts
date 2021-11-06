import { mapValues } from "lodash";
import { createStartingRounds, Game, GameStatus, Player } from "../../client/src/types/game.types";
import { DEFAULT_STARTING_ROLES_COUNT } from "../../client/src/utils/role-utils";

export const createDummyGame = ({
  id = generateRandomGameId(),
  players = {},
  actions = [],
  rounds = createStartingRounds(),
  rolesCount = DEFAULT_STARTING_ROLES_COUNT,
  status = GameStatus.LOBBY
}: Partial<Game> = {}): Game => {
  return {
    id,
    players: mapValues(players, (player) => ({ ...player, gameId: id })),
    endgame: {},
    actions,
    rounds,
    rolesCount,
    status
  };
};

export const createDummyPlayers = (n: number, gameId: string = generateRandomGameId()): Record<string, Player> => {
  const entries: [string, Player][] = Array.from({ length: n }, () => {
    const player = createDummyPlayer({ gameId });
    return [player.socketId, player]
  })

  return Object.fromEntries(entries)
}

export const createDummyPlayer = ({
  socketId = generateDummySocketId(),
  gameId,
  name,
  isHost,
  role,
  pendingActions = {}
}: Partial<Player> = {}): Player => {
  return {
    socketId,
    gameId,
    name,
    isHost,
    role,
    pendingActions,
    conditions: {
      shareRecords: []
    }
  }
}

export const generateDummySocketId = (): string => {
  return `-${generateRandomGameId().toLowerCase()}${generateRandomGameId().toLowerCase()}`;
}

export const generateRandomGameId = (): string => {
  const stringOptions = "ABCDEFGHIJLKMNOPQRSTUVWXYZ1234567890";
  const randomChars = [...Array(5).keys()].map(
    () => stringOptions[Math.floor(Math.random() * stringOptions.length)]
  );
  return randomChars.join("");
};

export function getColor(): string {
  return (
    "hsl(" +
    360 * Math.random() +
    "," +
    (25 + 70 * Math.random()) +
    "%," +
    (85 + 10 * Math.random()) +
    "%)"
  );
}

export function getColors(n: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < n; i++) {
    colors.push(selectColor(Math.floor(Math.random() * 999)));
  }
  return colors
}

function selectColor(number: number): string {
  const hue = number * 137.508; // use golden angle approximation
  return `hsl(${hue},50%,75%)`;
}