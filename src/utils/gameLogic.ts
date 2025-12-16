import {Pipe, PipeType, Direction} from '../types/game';

export const getConnectionsForPipe = (
  type: PipeType,
  rotation: number,
): Direction[] => {
  const baseConnections: Record<PipeType, Direction[]> = {
    [PipeType.STRAIGHT]: [Direction.UP, Direction.DOWN],
    [PipeType.CORNER]: [Direction.UP, Direction.RIGHT],
    [PipeType.T_JUNCTION]: [Direction.UP, Direction.RIGHT, Direction.DOWN],
    [PipeType.CROSS]: [
      Direction.UP,
      Direction.RIGHT,
      Direction.DOWN,
      Direction.LEFT,
    ],
  };

  const connections = baseConnections[type];
  const rotationSteps = rotation / 90;

  return connections.map(dir => rotateDirection(dir, rotationSteps));
};

const rotateDirection = (direction: Direction, steps: number): Direction => {
  const directions = [
    Direction.UP,
    Direction.RIGHT,
    Direction.DOWN,
    Direction.LEFT,
  ];
  const currentIndex = directions.indexOf(direction);
  const newIndex = (currentIndex + steps) % 4;
  return directions[newIndex];
};

export const checkConnection = (
  pipe1: Pipe,
  pipe2: Pipe,
  direction: Direction,
): boolean => {
  const oppositeDirection: Record<Direction, Direction> = {
    [Direction.UP]: Direction.DOWN,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.LEFT,
  };

  const pipe1Connections = getConnectionsForPipe(pipe1.type, pipe1.rotation);
  const pipe2Connections = getConnectionsForPipe(pipe2.type, pipe2.rotation);

  return (
    pipe1Connections.includes(direction) &&
    pipe2Connections.includes(oppositeDirection[direction])
  );
};
