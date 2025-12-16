// Types for the PipeFlow mathematical operations game

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: 'input' | 'output';
  value: number;
  position: Position;
}

export interface Component {
  id: string;
  symbol: string; // e.g., "×2", "+1", "+"
  operation?: string; // e.g., "multiply", "add"
  operand?: number; // e.g., 2 for ×2
  inputPorts?: number; // Number of input ports (default 1, can be 2 for +)
}

export interface PlacedComponent extends Component {
  slotId: string;
}

export interface ComponentSlot {
  id: string;
  position: Position;
  acceptedComponents?: string[]; // Optional: restrict which components can be placed
  placedComponent?: PlacedComponent;
  highlight?: boolean;
}

export interface Connection {
  id: string;
  from: string; // node/slot/port id
  to: string; // node/slot/port id
  fromPort?: number; // For components with multiple outputs
  toPort?: number; // For components with multiple inputs
}

export interface Level {
  id: number;
  inputValue: number;
  goalValue: number;
  slots: ComponentSlot[];
  availableComponents: Component[];
  connections: Connection[]; // Visual connections (auto-drawn)
}

export interface GameState {
  currentLevel: number;
  levels: Level[];
}
