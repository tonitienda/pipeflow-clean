import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {
  Canvas,
  Circle,
  Line,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import {Pipe, PipeType, Direction, GameState, Position} from '../types/game';
import {getConnectionsForPipe} from '../utils/gameLogic';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 40, 400);
const GRID_SIZE = 5;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const PIPE_RADIUS = CELL_SIZE * 0.15;

const initializeGame = (): GameState => {
  const grid: (Pipe | null)[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));

  // Set up a simple puzzle
  const source: Position = {row: 0, col: 0};
  const target: Position = {row: 4, col: 4};

  // Source pipe
  grid[0][0] = {
    type: PipeType.CORNER,
    rotation: 90,
    connections: [Direction.RIGHT, Direction.DOWN],
    isSource: true,
  };

  // Some initial pipes
  grid[0][1] = {
    type: PipeType.STRAIGHT,
    rotation: 0,
    connections: [Direction.LEFT, Direction.RIGHT],
  };

  grid[0][2] = {
    type: PipeType.CORNER,
    rotation: 180,
    connections: [Direction.LEFT, Direction.DOWN],
  };

  grid[1][2] = {
    type: PipeType.STRAIGHT,
    rotation: 90,
    connections: [Direction.UP, Direction.DOWN],
  };

  grid[2][2] = {
    type: PipeType.CORNER,
    rotation: 270,
    connections: [Direction.UP, Direction.RIGHT],
  };

  grid[2][3] = {
    type: PipeType.STRAIGHT,
    rotation: 0,
    connections: [Direction.LEFT, Direction.RIGHT],
  };

  grid[2][4] = {
    type: PipeType.CORNER,
    rotation: 180,
    connections: [Direction.LEFT, Direction.DOWN],
  };

  grid[3][4] = {
    type: PipeType.STRAIGHT,
    rotation: 90,
    connections: [Direction.UP, Direction.DOWN],
  };

  // Target pipe
  grid[4][4] = {
    type: PipeType.CORNER,
    rotation: 270,
    connections: [Direction.UP, Direction.RIGHT],
    isTarget: true,
  };

  return {
    grid,
    gridSize: GRID_SIZE,
    source,
    target,
    isComplete: false,
  };
};

const GameCanvas = () => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  const handleCellPress = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const newGrid = prev.grid.map(r => [...r]);
      const pipe = newGrid[row][col];

      if (pipe && !pipe.isSource && !pipe.isTarget) {
        // Rotate the pipe 90 degrees
        const newRotation = (pipe.rotation + 90) % 360;
        newGrid[row][col] = {
          ...pipe,
          rotation: newRotation,
          connections: getConnectionsForPipe(pipe.type, newRotation),
        };
      }

      return {
        ...prev,
        grid: newGrid,
      };
    });
  }, []);

  const renderPipe = (pipe: Pipe, x: number, y: number) => {
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;
    const paths: JSX.Element[] = [];

    const connections = getConnectionsForPipe(pipe.type, pipe.rotation);

    connections.forEach((direction, index) => {
      const path = Skia.Path.Make();
      path.moveTo(centerX, centerY);

      switch (direction) {
        case Direction.UP:
          path.lineTo(centerX, y);
          break;
        case Direction.DOWN:
          path.lineTo(centerX, y + CELL_SIZE);
          break;
        case Direction.LEFT:
          path.lineTo(x, centerY);
          break;
        case Direction.RIGHT:
          path.lineTo(x + CELL_SIZE, centerY);
          break;
      }

      paths.push(
        <Path
          key={`${x}-${y}-${index}`}
          path={path}
          color={
            pipe.isSource ? '#4CAF50' : pipe.isTarget ? '#F44336' : '#2196F3'
          }
          style="stroke"
          strokeWidth={PIPE_RADIUS * 2}
          strokeCap="round"
        />,
      );
    });

    // Center circle
    const color = pipe.isSource
      ? '#4CAF50'
      : pipe.isTarget
      ? '#F44336'
      : '#2196F3';
    paths.push(
      <Circle
        key={`${x}-${y}-center`}
        cx={centerX}
        cy={centerY}
        r={PIPE_RADIUS}
        color={color}
      />,
    );

    return paths;
  };

  const renderGrid = () => {
    const elements: JSX.Element[] = [];

    // Draw grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = i * CELL_SIZE;

      // Vertical lines
      elements.push(
        <Line
          key={`v-${i}`}
          p1={vec(pos, 0)}
          p2={vec(pos, CANVAS_SIZE)}
          color="#e0e0e0"
          strokeWidth={1}
        />,
      );

      // Horizontal lines
      elements.push(
        <Line
          key={`h-${i}`}
          p1={vec(0, pos)}
          p2={vec(CANVAS_SIZE, pos)}
          color="#e0e0e0"
          strokeWidth={1}
        />,
      );
    }

    // Draw pipes
    gameState.grid.forEach((row, rowIndex) => {
      row.forEach((pipe, colIndex) => {
        if (pipe) {
          const x = colIndex * CELL_SIZE;
          const y = rowIndex * CELL_SIZE;
          elements.push(...renderPipe(pipe, x, y));
        }
      });
    });

    return elements;
  };

  const createTouchableGrid = () => {
    const touchables: JSX.Element[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        touchables.push(
          <TouchableOpacity
            key={`touch-${row}-${col}`}
            style={[
              styles.touchableCell,
              {
                left: x,
                top: y,
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
            onPress={() => handleCellPress(row, col)}
          />,
        );
      }
    }

    return touchables;
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Canvas
          style={{width: CANVAS_SIZE, height: CANVAS_SIZE}}
          pointerEvents="none">
          {renderGrid()}
        </Canvas>
        {createTouchableGrid()}
      </View>
      <View style={styles.info}>
        <Text style={styles.infoText}>Tap pipes to rotate them</Text>
        <Text style={styles.infoText}>Connect green source to red target</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  touchableCell: {
    position: 'absolute',
  },
  info: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
});

export default GameCanvas;
