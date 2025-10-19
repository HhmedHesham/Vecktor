import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export type Point = { x: number; y: number };
export type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text';
// Fill Style Types
export type NoFill = { type: 'none' };
export type SolidFill = { type: 'solid'; color: string };
export type LinearGradientFill = { type: 'linear-gradient'; color1: string; color2: string };
export type FillStyle = NoFill | SolidFill | LinearGradientFill;
export type FillType = FillStyle['type'];
// Discriminated union for all drawable objects
export type FreehandPath = {
  type: 'freehand';
  points: Point[];
  color: string;
  strokeWidth: number;
};
export type Line = {
  type: 'line';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
};
export type Rectangle = {
  type: 'rectangle';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
  fill: FillStyle;
};
export type Circle = {
  type: 'circle';
  center: Point;
  radius: number;
  color: string;
  strokeWidth: number;
  fill: FillStyle;
};
export type Text = {
  type: 'text';
  content: string;
  position: Point;
  color: string;
  fontSize: number;
};
export type Drawable = FreehandPath | Line | Rectangle | Circle | Text;
type DrawingState = {
  drawables: Drawable[];
  currentDrawable: Drawable | null;
  history: Drawable[][];
  historyIndex: number;
  isDrawing: boolean;
  tool: Tool;
  color: string;
  strokeWidth: number;
  fillType: FillType;
  fillColor1: string;
  fillColor2: string;
};
type DrawingActions = {
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFillType: (type: FillType) => void;
  setFillColor1: (color: string) => void;
  setFillColor2: (color: string) => void;
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  endDrawing: () => void;
  addDrawable: (drawable: Drawable) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};
const initialState: DrawingState = {
  drawables: [],
  currentDrawable: null,
  history: [[]],
  historyIndex: 0,
  isDrawing: false,
  tool: 'pen',
  color: '#2E2E2E',
  strokeWidth: 5,
  fillType: 'none',
  fillColor1: '#FF6B6B',
  fillColor2: '#FED766',
};
export const useDrawingStore = create<DrawingState & DrawingActions>()(
  immer((set, get) => ({
    ...initialState,
    setTool: (tool) => set({ tool }),
    setColor: (color) => set({ color }),
    setStrokeWidth: (width) => set({ strokeWidth: width }),
    setFillType: (type) => set({ fillType: type }),
    setFillColor1: (color) => set({ fillColor1: color }),
    setFillColor2: (color) => set({ fillColor2: color }),
    startDrawing: (point) => {
      set((state) => {
        state.isDrawing = true;
        const { tool, color, strokeWidth, fillType, fillColor1, fillColor2 } = state;
        const commonProps = {
          color: tool === 'eraser' ? '#FDF8F0' : color,
          strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        };
        switch (tool) {
          case 'pen':
          case 'eraser':
            state.currentDrawable = { type: 'freehand', points: [point], ...commonProps };
            break;
          case 'line':
            state.currentDrawable = { type: 'line', start: point, end: point, ...commonProps };
            break;
          case 'rectangle': {
            let fill: FillStyle = { type: 'none' };
            if (fillType === 'solid') fill = { type: 'solid', color: fillColor1 };
            if (fillType === 'linear-gradient') fill = { type: 'linear-gradient', color1: fillColor1, color2: fillColor2 };
            state.currentDrawable = { type: 'rectangle', start: point, end: point, ...commonProps, fill };
            break;
          }
          case 'circle': {
            let fill: FillStyle = { type: 'none' };
            if (fillType === 'solid') fill = { type: 'solid', color: fillColor1 };
            if (fillType === 'linear-gradient') fill = { type: 'linear-gradient', color1: fillColor1, color2: fillColor2 };
            state.currentDrawable = { type: 'circle', center: point, radius: 0, ...commonProps, fill };
            break;
          }
          case 'text':
            state.isDrawing = false;
            break;
        }
      });
    },
    continueDrawing: (point) => {
      if (!get().isDrawing || !get().currentDrawable) return;
      set((state) => {
        const current = state.currentDrawable;
        if (!current) return;
        switch (current.type) {
          case 'freehand':
            current.points.push(point);
            break;
          case 'line':
          case 'rectangle':
            current.end = point;
            break;
          case 'circle': {
            const dx = point.x - current.center.x;
            const dy = point.y - current.center.y;
            current.radius = Math.sqrt(dx * dx + dy * dy);
            break;
          }
        }
      });
    },
    endDrawing: () => {
      if (!get().isDrawing) return;
      set((state) => {
        if (state.currentDrawable) {
          let isValidDrawable = true;
          if (state.currentDrawable.type === 'circle' && state.currentDrawable.radius === 0) {
            isValidDrawable = false;
          }
          if ( (state.currentDrawable.type === 'line' || state.currentDrawable.type === 'rectangle') &&
              (state.currentDrawable.start.x === state.currentDrawable.end.x && state.currentDrawable.start.y === state.currentDrawable.end.y)) {
            isValidDrawable = false;
          }
          if (isValidDrawable) {
            state.drawables.push(state.currentDrawable);
          }
        }
        state.currentDrawable = null;
        state.isDrawing = false;
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...state.drawables]);
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    },
    addDrawable: (drawable) => {
      set((state) => {
        state.drawables.push(drawable);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...state.drawables]);
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    },
    undo: () => {
      if (get().historyIndex <= 0) return;
      set((state) => {
        state.historyIndex--;
        state.drawables = state.history[state.historyIndex];
      });
    },
    redo: () => {
      if (get().historyIndex >= get().history.length - 1) return;
      set((state) => {
        state.historyIndex++;
        state.drawables = state.history[state.historyIndex];
      });
    },
    clear: () => {
      set({
        drawables: [],
        currentDrawable: null,
        history: [[]],
        historyIndex: 0,
      });
    },
  }))
);