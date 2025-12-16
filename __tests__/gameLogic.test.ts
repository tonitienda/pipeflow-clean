import {getConnectionsForPipe, checkConnection} from '../src/utils/gameLogic';
import {PipeType, Direction, Pipe} from '../src/types/game';

describe('Game Logic', () => {
  describe('getConnectionsForPipe', () => {
    it('should return correct connections for straight pipe at 0 degrees', () => {
      const connections = getConnectionsForPipe(PipeType.STRAIGHT, 0);
      expect(connections).toContain(Direction.UP);
      expect(connections).toContain(Direction.DOWN);
      expect(connections).toHaveLength(2);
    });

    it('should return correct connections for straight pipe at 90 degrees', () => {
      const connections = getConnectionsForPipe(PipeType.STRAIGHT, 90);
      expect(connections).toContain(Direction.RIGHT);
      expect(connections).toContain(Direction.LEFT);
      expect(connections).toHaveLength(2);
    });

    it('should return correct connections for corner pipe at 0 degrees', () => {
      const connections = getConnectionsForPipe(PipeType.CORNER, 0);
      expect(connections).toContain(Direction.UP);
      expect(connections).toContain(Direction.RIGHT);
      expect(connections).toHaveLength(2);
    });

    it('should return correct connections for corner pipe at 90 degrees', () => {
      const connections = getConnectionsForPipe(PipeType.CORNER, 90);
      expect(connections).toContain(Direction.RIGHT);
      expect(connections).toContain(Direction.DOWN);
      expect(connections).toHaveLength(2);
    });

    it('should return correct connections for T-junction', () => {
      const connections = getConnectionsForPipe(PipeType.T_JUNCTION, 0);
      expect(connections).toHaveLength(3);
    });

    it('should return correct connections for cross pipe', () => {
      const connections = getConnectionsForPipe(PipeType.CROSS, 0);
      expect(connections).toHaveLength(4);
    });
  });

  describe('checkConnection', () => {
    it('should return true when pipes connect properly', () => {
      const pipe1: Pipe = {
        type: PipeType.STRAIGHT,
        rotation: 0,
        connections: [Direction.UP, Direction.DOWN],
      };

      const pipe2: Pipe = {
        type: PipeType.STRAIGHT,
        rotation: 0,
        connections: [Direction.UP, Direction.DOWN],
      };

      const result = checkConnection(pipe1, pipe2, Direction.DOWN);
      expect(result).toBe(true);
    });

    it('should return false when pipes do not connect', () => {
      const pipe1: Pipe = {
        type: PipeType.STRAIGHT,
        rotation: 0,
        connections: [Direction.UP, Direction.DOWN],
      };

      const pipe2: Pipe = {
        type: PipeType.STRAIGHT,
        rotation: 90,
        connections: [Direction.LEFT, Direction.RIGHT],
      };

      const result = checkConnection(pipe1, pipe2, Direction.DOWN);
      expect(result).toBe(false);
    });

    it('should connect corner pipes correctly', () => {
      const pipe1: Pipe = {
        type: PipeType.CORNER,
        rotation: 0,
        connections: [Direction.UP, Direction.RIGHT],
      };

      const pipe2: Pipe = {
        type: PipeType.CORNER,
        rotation: 180,
        connections: [Direction.DOWN, Direction.LEFT],
      };

      const result = checkConnection(pipe1, pipe2, Direction.RIGHT);
      expect(result).toBe(true);
    });
  });
});
