import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Skia,
  Text as SkiaText,
  matchFont,
} from '@shopify/react-native-skia';
import {Level, Component, Position} from '../types/pipeflow';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const BOARD_WIDTH = SCREEN_WIDTH - 40;
const BOARD_HEIGHT = SCREEN_HEIGHT * 0.6;
const NODE_RADIUS = 30;
const COMPONENT_WIDTH = 80;
const COMPONENT_HEIGHT = 60;

// Level definitions
const createLevels = (): Level[] => {
  return [
    // Level 1: Simple multiplication
    {
      id: 1,
      inputValue: 1,
      goalValue: 2,
      slots: [
        {
          id: 'slot1',
          position: {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2},
        },
      ],
      availableComponents: [
        {id: 'comp1', symbol: '×2', operation: 'multiply', operand: 2},
      ],
      connections: [
        {id: 'conn1', from: 'input', to: 'slot1'},
        {id: 'conn2', from: 'slot1', to: 'output'},
      ],
    },
    // Level 2: Two operations in sequence
    {
      id: 2,
      inputValue: 1,
      goalValue: 3,
      slots: [
        {
          id: 'slot1',
          position: {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT * 0.35},
        },
        {
          id: 'slot2',
          position: {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT * 0.55},
        },
      ],
      availableComponents: [
        {id: 'comp1', symbol: '×2', operation: 'multiply', operand: 2},
        {id: 'comp2', symbol: '+1', operation: 'add', operand: 1},
      ],
      connections: [
        {id: 'conn1', from: 'input', to: 'slot1'},
        {id: 'conn2', from: 'slot1', to: 'slot2'},
        {id: 'conn3', from: 'slot2', to: 'output'},
      ],
    },
    // Level 3: Fan-out with multiple inputs
    {
      id: 3,
      inputValue: 1,
      goalValue: 3,
      slots: [
        {
          id: 'slot1',
          position: {x: BOARD_WIDTH * 0.3, y: BOARD_HEIGHT * 0.4},
          acceptedComponents: ['comp1'],
        },
        {
          id: 'slot2',
          position: {x: BOARD_WIDTH * 0.65, y: BOARD_HEIGHT * 0.55},
          acceptedComponents: ['comp2'],
        },
      ],
      availableComponents: [
        {id: 'comp1', symbol: '×2', operation: 'multiply', operand: 2},
        {id: 'comp2', symbol: '+', operation: 'add', inputPorts: 2},
      ],
      connections: [
        {id: 'conn1', from: 'input', to: 'slot1'},
        {id: 'conn2', from: 'input', to: 'slot2', toPort: 0},
        {id: 'conn3', from: 'slot1', to: 'slot2', toPort: 1},
        {id: 'conn4', from: 'slot2', to: 'output'},
      ],
    },
  ];
};

const PipeflowScreen = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levels, setLevels] = useState<Level[]>(createLevels());
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null,
  );

  const currentLevel = levels[currentLevelIndex];

  // Create font for Skia text rendering - use Helvetica which is reliably available on iOS
  const font = matchFont({
    fontFamily: 'Helvetica',
    fontSize: 20,
    fontWeight: 'bold',
  });

  // Get components that haven't been placed yet
  const getAvailableComponents = useCallback(() => {
    const placedComponentIds = currentLevel.slots
      .map(slot => slot.placedComponent?.id)
      .filter(Boolean);
    return currentLevel.availableComponents.filter(
      comp => !placedComponentIds.includes(comp.id),
    );
  }, [currentLevel]);

  const handleComponentTap = useCallback((component: Component) => {
    setSelectedComponent(prev =>
      prev?.id === component.id ? null : component,
    );
  }, []);

  const handleSlotTap = useCallback(
    (slotId: string) => {
      const newLevels = [...levels];
      const levelSlots = newLevels[currentLevelIndex].slots;
      const slotIndex = levelSlots.findIndex(s => s.id === slotId);

      if (slotIndex === -1) return;

      const slot = levelSlots[slotIndex];

      // If slot has a component, remove it
      if (slot.placedComponent) {
        levelSlots[slotIndex] = {
          ...slot,
          placedComponent: undefined,
        };
        setLevels(newLevels);
        return;
      }

      // If a component is selected and slot is empty, place it
      if (selectedComponent) {
        const isAccepted =
          !slot.acceptedComponents ||
          slot.acceptedComponents.includes(selectedComponent.id);

        if (isAccepted) {
          levelSlots[slotIndex] = {
            ...slot,
            placedComponent: {...selectedComponent, slotId: slot.id},
          };
          setLevels(newLevels);
          setSelectedComponent(null); // Deselect after placing
        }
      }
    },
    [selectedComponent, levels, currentLevelIndex],
  );

  const nextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
    }
  };

  const renderCurvedPipe = (from: Position, to: Position) => {
    const path = Skia.Path.Make();

    const startX = from.x;
    const startY = from.y;
    const endX = to.x;
    const endY = to.y;

    // Create curved Bezier path
    path.moveTo(startX, startY);

    const midY = (startY + endY) / 2;
    const controlPoint1X = startX;
    const controlPoint1Y = midY;
    const controlPoint2X = endX;
    const controlPoint2Y = midY;

    path.cubicTo(
      controlPoint1X,
      controlPoint1Y,
      controlPoint2X,
      controlPoint2Y,
      endX,
      endY,
    );

    return path;
  };

  const renderBoard = () => {
    const elements: JSX.Element[] = [];

    // Input node position
    const inputPos: Position = {
      x: BOARD_WIDTH / 2,
      y: NODE_RADIUS + 20,
    };

    // Output node position
    const outputPos: Position = {
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT - NODE_RADIUS - 20,
    };

    // Draw connections (pipes)
    currentLevel.connections.forEach(conn => {
      let fromPos: Position = inputPos;
      let toPos: Position = outputPos;

      if (conn.from === 'input') {
        fromPos = inputPos;
      } else {
        const fromSlot = currentLevel.slots.find(s => s.id === conn.from);
        if (fromSlot) {
          fromPos = fromSlot.position;
        }
      }

      if (conn.to === 'output') {
        toPos = outputPos;
      } else {
        const toSlot = currentLevel.slots.find(s => s.id === conn.to);
        if (toSlot) {
          toPos = toSlot.position;
          // Adjust for input ports if needed
          if (
            conn.toPort !== undefined &&
            toSlot.placedComponent?.inputPorts === 2
          ) {
            toPos = {
              x: toPos.x - (conn.toPort === 0 ? 20 : -20),
              y: toPos.y - COMPONENT_HEIGHT / 2,
            };
          }
        }
      }

      const pipePath = renderCurvedPipe(
        {
          x: fromPos.x,
          y:
            fromPos.y +
            (conn.from === 'input' ? NODE_RADIUS : COMPONENT_HEIGHT / 2),
        },
        {
          x: toPos.x,
          y:
            toPos.y -
            (conn.to === 'output' ? NODE_RADIUS : COMPONENT_HEIGHT / 2),
        },
      );

      elements.push(
        <Path
          key={conn.id}
          path={pipePath}
          color="#60A5FA"
          style="stroke"
          strokeWidth={4}
        />,
      );
    });

    // Draw input node
    elements.push(
      <Circle
        key="input-circle"
        cx={inputPos.x}
        cy={inputPos.y}
        r={NODE_RADIUS}
        color="#14B8A6"
      />,
    );
    elements.push(
      <SkiaText
        key="input-text"
        x={inputPos.x - 10}
        y={inputPos.y + 8}
        text={currentLevel.inputValue.toString()}
        font={font}
        color="#FFFFFF"
      />,
    );

    // Draw output node
    elements.push(
      <Circle
        key="output-circle"
        cx={outputPos.x}
        cy={outputPos.y}
        r={NODE_RADIUS}
        color="#8B5CF6"
      />,
    );
    elements.push(
      <SkiaText
        key="output-text"
        x={outputPos.x - 10}
        y={outputPos.y + 8}
        text={currentLevel.goalValue.toString()}
        font={font}
        color="#FFFFFF"
      />,
    );

    // Draw component slots
    currentLevel.slots.forEach(slot => {
      const slotPath = Skia.Path.Make();
      slotPath.addRRect({
        rect: {
          x: slot.position.x - COMPONENT_WIDTH / 2,
          y: slot.position.y - COMPONENT_HEIGHT / 2,
          width: COMPONENT_WIDTH,
          height: COMPONENT_HEIGHT,
        },
        rx: 12,
        ry: 12,
      });

      // Draw slot background
      elements.push(
        <Path
          key={`${slot.id}-bg`}
          path={slotPath}
          color={slot.highlight ? '#FCD34D' : '#E5E7EB'}
          style="fill"
        />,
      );

      // Draw slot border
      elements.push(
        <Path
          key={`${slot.id}-border`}
          path={slotPath}
          color={slot.highlight ? '#F59E0B' : '#9CA3AF'}
          style="stroke"
          strokeWidth={2}
        />,
      );

      // Draw placed component if any
      if (slot.placedComponent) {
        const comp = slot.placedComponent;

        // Component background
        const compPath = Skia.Path.Make();
        compPath.addRRect({
          rect: {
            x: slot.position.x - COMPONENT_WIDTH / 2 + 4,
            y: slot.position.y - COMPONENT_HEIGHT / 2 + 4,
            width: COMPONENT_WIDTH - 8,
            height: COMPONENT_HEIGHT - 8,
          },
          rx: 8,
          ry: 8,
        });

        elements.push(
          <Path
            key={`${slot.id}-comp-bg`}
            path={compPath}
            color="#60A5FA"
            style="fill"
          />,
        );

        // Component text - render only if we have a valid symbol
        if (comp.symbol) {
          try {
            const textWidth = font.getMetrics
              ? font.measureText(comp.symbol).width
              : 20;
            elements.push(
              <SkiaText
                key={`${slot.id}-comp-text`}
                x={slot.position.x - textWidth / 2}
                y={slot.position.y + 8}
                text={comp.symbol}
                font={font}
                color="#FFFFFF"
              />,
            );
          } catch (e) {
            console.log('Error rendering text:', e);
          }
        }

        // Draw input ports for multi-input components
        if (comp.inputPorts === 2) {
          elements.push(
            <Circle
              key={`${slot.id}-port-0`}
              cx={slot.position.x - 20}
              cy={slot.position.y - COMPONENT_HEIGHT / 2}
              r={6}
              color="#1E293B"
            />,
          );
          elements.push(
            <Circle
              key={`${slot.id}-port-1`}
              cx={slot.position.x + 20}
              cy={slot.position.y - COMPONENT_HEIGHT / 2}
              r={6}
              color="#1E293B"
            />,
          );
        }
      }
    });

    return elements;
  };

  return (
    <View style={styles.container} testID="pipeflow-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PIPEFLOW</Text>
        <Text style={styles.levelText}>Level {currentLevel.id}</Text>
      </View>

      {/* Board */}
      <View style={styles.boardContainer}>
        <View
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            position: 'relative',
          }}>
          <Canvas
            style={{
              width: BOARD_WIDTH,
              height: BOARD_HEIGHT,
              position: 'absolute',
            }}
            pointerEvents="none">
            {renderBoard()}
          </Canvas>

          {/* Touchable slot overlays */}
          {currentLevel.slots.map(slot => (
            <TouchableOpacity
              key={`slot-touch-${slot.id}`}
              style={{
                position: 'absolute',
                left: slot.position.x - COMPONENT_WIDTH / 2,
                top: slot.position.y - COMPONENT_HEIGHT / 2,
                width: COMPONENT_WIDTH,
                height: COMPONENT_HEIGHT,
              }}
              onPress={() => handleSlotTap(slot.id)}
            />
          ))}
        </View>
      </View>

      {/* Level navigation (for testing) */}
      <View style={styles.levelNav}>
        <TouchableOpacity
          testID="prev-level-button"
          style={[
            styles.navButton,
            currentLevelIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={prevLevel}
          disabled={currentLevelIndex === 0}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="next-level-button"
          style={[
            styles.navButton,
            currentLevelIndex === levels.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={nextLevel}
          disabled={currentLevelIndex === levels.length - 1}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Component Tray */}
      <View style={styles.tray} testID="component-tray">
        {getAvailableComponents().map((component, index) => (
          <TouchableOpacity
            key={`${component.id}-${index}`}
            style={[
              styles.componentCard,
              selectedComponent?.id === component.id &&
                styles.componentCardSelected,
            ]}
            onPress={() => handleComponentTap(component)}>
            <Text style={styles.componentText}>{component.symbol}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1E293B',
  },
  levelText: {
    fontSize: 18,
    color: '#64748B',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  levelNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#60A5FA',
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tray: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 20,
  },
  componentCard: {
    width: COMPONENT_WIDTH,
    height: COMPONENT_HEIGHT,
    backgroundColor: '#60A5FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  componentCardSelected: {
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  componentText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PipeflowScreen;
