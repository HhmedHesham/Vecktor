import {
  Paintbrush,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Download,
  Minus,
  RectangleHorizontal,
  Circle,
  Type,
  Palette,
  Spline,
  Slash,
} from 'lucide-react';
import { useDrawingStore, FillType } from '@/hooks/use-drawing-store';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { convertDrawablesToSvg, downloadSvg } from '@/lib/svg-converter';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useShallow } from 'zustand/react/shallow';
const colors = [
  '#2E2E2E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766',
  '#F67280', '#C06C84', '#6C5B7B', '#355C7D', '#99B898'
];
const ColorPicker = ({ color, setColor }: { color: string; setColor: (color: string) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start gap-2 transition-all hover:scale-105 active:scale-95">
        <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: color }} />
        <span className="font-mono text-sm">{color}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-2" side="right">
      <div className="grid grid-cols-5 gap-1">
        {colors.map((c) => (
          <Button
            key={c}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-ring ring-offset-2' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
    </PopoverContent>
  </Popover>
);
export function Toolbar() {
  const {
    tool, color, strokeWidth, drawables, historyIndex, history,
    fillType, fillColor1, fillColor2,
  } = useDrawingStore(useShallow(s => s));
  const {
    setTool, setColor, setStrokeWidth, undo, redo, clear,
    setFillType, setFillColor1, setFillColor2,
  } = useDrawingStore.getState();
  const handleExport = () => {
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (canvas) {
      const svgString = convertDrawablesToSvg(drawables, canvas.clientWidth, canvas.clientHeight);
      downloadSvg(svgString, 'vektor-drawing.svg');
    }
  };
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isShapeTool = tool === 'rectangle' || tool === 'circle';
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col gap-4 p-4 bg-card text-card-foreground rounded-lg shadow-md border animate-fade-in">
        <div className="grid grid-cols-3 gap-2">
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'pen' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pen')} className="transition-all hover:scale-105 active:scale-95"><Paintbrush className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Pen</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')} className="transition-all hover:scale-105 active:scale-95"><Eraser className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Eraser</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'text' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('text')} className="transition-all hover:scale-105 active:scale-95"><Type className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Text</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'line' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('line')} className="transition-all hover:scale-105 active:scale-95"><Minus className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Line</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'rectangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('rectangle')} className="transition-all hover:scale-105 active:scale-95"><RectangleHorizontal className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Rectangle</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={tool === 'circle' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('circle')} className="transition-all hover:scale-105 active:scale-95"><Circle className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Circle</p></TooltipContent></Tooltip>
        </div>
        <Separator />
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Color</label>
          <ColorPicker color={color} setColor={setColor} />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            {tool === 'text' ? 'Font Size' : 'Stroke'}
          </label>
          <div className="flex items-center gap-2">
            <Slider
              min={tool === 'text' ? 8 : 0}
              max={tool === 'text' ? 128 : 50}
              step={1}
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
            />
            <span className="text-sm font-mono w-8 text-center">{strokeWidth}</span>
          </div>
        </div>
        {isShapeTool && (
          <>
            <Separator />
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Fill</label>
              <ToggleGroup type="single" value={fillType} onValueChange={(value: FillType) => value && setFillType(value)} className="w-full grid grid-cols-3">
                <ToggleGroupItem value="none" aria-label="No fill"><Slash className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="solid" aria-label="Solid fill"><Palette className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="linear-gradient" aria-label="Gradient fill"><Spline className="h-4 w-4" /></ToggleGroupItem>
              </ToggleGroup>
              {fillType === 'solid' && <ColorPicker color={fillColor1} setColor={setFillColor1} />}
              {fillType === 'linear-gradient' && (
                <div className="space-y-2">
                  <ColorPicker color={fillColor1} setColor={setFillColor1} />
                  <ColorPicker color={fillColor2} setColor={setFillColor2} />
                </div>
              )}
            </div>
          </>
        )}
        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="transition-all hover:scale-105 active:scale-95"><Undo className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Undo</p></TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="transition-all hover:scale-105 active:scale-95"><Redo className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent side="right"><p>Redo</p></TooltipContent></Tooltip>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" onClick={clear} className="w-full transition-all hover:scale-105 active:scale-95"><Trash2 className="h-4 w-4 mr-2" /> Clear</Button></TooltipTrigger><TooltipContent side="right"><p>Clear Canvas</p></TooltipContent></Tooltip>
          <Button onClick={handleExport} className="w-full bg-brand-accent text-white hover:bg-brand-accent/90 transition-all hover:scale-105 active:scale-95">
            <Download className="h-4 w-4 mr-2" /> Export SVG
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}