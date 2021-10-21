
import { RoomName } from '../../../client/src/types/game.types';
import { assignPlayersToRooms } from './utils';

describe('assignPlayersToRooms', () => {
  test('splits six players equally between two rooms', () => {
    const result = assignPlayersToRooms(['1', '2', '3', '4', '5', '6']);
    const values = Object.values(result);
    expect(values).toHaveLength(6);
    expect(values.filter(val => val === RoomName.A)).toHaveLength(3);
    expect(values.filter((val) => val === RoomName.B)).toHaveLength(3);
  })

  test("splits seven players into room of 4 and 3", () => {
    const result = assignPlayersToRooms(["1", "2", "3", "4", "5", "6", "7"]);
    const values = Object.values(result);
    expect(values).toHaveLength(7);
    expect(values.filter((val) => val === RoomName.A)).toHaveLength(4);
    expect(values.filter((val) => val === RoomName.B)).toHaveLength(3);
  });
})