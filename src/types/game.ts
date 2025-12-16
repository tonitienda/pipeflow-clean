export enum PipeType {
  STRAIGHT = 'straight',
  CORNER = 'corner',
  T_JUNCTION = 't-junction',
  CROSS = 'cross',
}

export enum Direction {
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
}

export interface Pipe {
  type: PipeType;
  rotation: number; // 0, 90, 180, 270
  connections: Direction[];
  isSource?: boolean;
  isTarget?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  grid: (Pipe | null)[][];
  gridSize: number;
  source: Position;
  target: Position;
  isComplete: boolean;
}
