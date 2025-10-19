import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDrawingStore, Point, Drawable } from '@/hooks/use-drawing-store';
import { useShallow } from 'zustand/react/shallow';
import { Toolbar } from '@/components/Toolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { PanelTopOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
type TextInputState = {
  visible: boolean;
  x: number;
  y: number;
  value: string;
};
export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [textInput, setTextInput] = useState<TextInputState>({ visible: false, x: 0, y: 0, value: '' });
  const { drawables, currentDrawable, isDrawing, tool, color, strokeWidth } = useDrawingStore(
    useShallow((s) => ({
      drawables: s.drawables,
      currentDrawable: s.currentDrawable,
      isDrawing: s.isDrawing,
      tool: s.tool,
      color: s.color,
      strokeWidth: s.strokeWidth,
    }))
  );
  const { startDrawing, continueDrawing, endDrawing, addDrawable } = useDrawingStore.getState();
  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };
  const handleTextSubmit = () => {
    if (textInput.value.trim() === '') {
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
      return;
    }
    addDrawable({
      type: 'text',
      content: textInput.value,
      position: { x: textInput.x, y: textInput.y },
      color: color,
      fontSize: strokeWidth,
    });
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (textInput.visible) {
      handleTextSubmit();
      return;
    }
    const point = getPoint(e);
    if (tool === 'text') {
      setTextInput({ visible: true, x: point.x, y: point.y, value: '' });
    } else {
      startDrawing(point);
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    continueDrawing(getPoint(e));
  };
  const handleMouseUp = () => {
    if (!isDrawing) return;
    endDrawing();
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (textInput.visible) {
      handleTextSubmit();
      return;
    }
    const point = getPoint(e);
    if (tool === 'text') {
      setTextInput({ visible: true, x: point.x, y: point.y, value: '' });
    } else {
      startDrawing(point);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    continueDrawing(getPoint(e));
  };
  const handleTouchEnd = () => {
    if (!isDrawing) return;
    endDrawing();
  };
  const drawDrawable = (ctx: CanvasRenderingContext2D, drawable: Drawable) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    switch (drawable.type) {
      case 'freehand':
        ctx.strokeStyle = drawable.color;
        ctx.lineWidth = drawable.strokeWidth;
        ctx.beginPath();
        if (drawable.points.length < 2) return;
        ctx.moveTo(drawable.points[0].x, drawable.points[0].y);
        for (let i = 1; i < drawable.points.length - 1; i++) {
          const p1 = drawable.points[i];
          const p2 = drawable.points[i + 1];
          const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        }
        ctx.lineTo(drawable.points[drawable.points.length - 1].x, drawable.points[drawable.points.length - 1].y);
        ctx.stroke();
        break;
      case 'line':
        ctx.strokeStyle = drawable.color;
        ctx.lineWidth = drawable.strokeWidth;
        ctx.beginPath();
        ctx.moveTo(drawable.start.x, drawable.start.y);
        ctx.lineTo(drawable.end.x, drawable.end.y);
        ctx.stroke();
        break;
      case 'rectangle': {
        ctx.strokeStyle = drawable.color;
        ctx.lineWidth = drawable.strokeWidth;
        ctx.beginPath();
        const width = drawable.end.x - drawable.start.x;
        const height = drawable.end.y - drawable.start.y;
        ctx.rect(drawable.start.x, drawable.start.y, width, height);
        if (drawable.fill.type === 'solid') {
          ctx.fillStyle = drawable.fill.color;
          ctx.fill();
        } else if (drawable.fill.type === 'linear-gradient') {
          const gradient = ctx.createLinearGradient(drawable.start.x, drawable.start.y, drawable.end.x, drawable.end.y);
          gradient.addColorStop(0, drawable.fill.color1);
          gradient.addColorStop(1, drawable.fill.color2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        if (drawable.strokeWidth > 0) {
          ctx.stroke();
        }
        break;
      }
      case 'circle':
        ctx.strokeStyle = drawable.color;
        ctx.lineWidth = drawable.strokeWidth;
        ctx.beginPath();
        ctx.arc(drawable.center.x, drawable.center.y, drawable.radius, 0, 2 * Math.PI);
        if (drawable.fill.type === 'solid') {
          ctx.fillStyle = drawable.fill.color;
          ctx.fill();
        } else if (drawable.fill.type === 'linear-gradient') {
          const gradient = ctx.createLinearGradient(
            drawable.center.x - drawable.radius, drawable.center.y - drawable.radius,
            drawable.center.x + drawable.radius, drawable.center.y + drawable.radius
          );
          gradient.addColorStop(0, drawable.fill.color1);
          gradient.addColorStop(1, drawable.fill.color2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        if (drawable.strokeWidth > 0) {
          ctx.stroke();
        }
        break;
      case 'text':
        ctx.fillStyle = drawable.color;
        ctx.font = `${drawable.fontSize}px Inter, sans-serif`;
        ctx.textBaseline = 'top';
        drawable.content.split('\n').forEach((line, index) => {
          ctx.fillText(line, drawable.position.x, drawable.position.y + index * drawable.fontSize * 1.2);
        });
        break;
    }
  };
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== canvas.clientWidth * dpr || canvas.height !== canvas.clientHeight * dpr) {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FDF8F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawables.forEach((d) => drawDrawable(ctx, d));
    if (currentDrawable) {
      drawDrawable(ctx, currentDrawable);
    }
  }, [drawables, currentDrawable]);
  useEffect(() => {
    const animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);
  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);
  return (
    <div className="w-screen h-screen bg-brand-bg overflow-hidden flex flex-col text-brand-text">
      <header className="text-center py-4 border-b border-brand-text/10 flex-shrink-0">
        <h1 className="font-heading text-4xl md:text-5xl text-brand-text animate-fade-in">Vektor</h1>
        <p className="text-muted-foreground text-sm">Draw freely, export as SVG.</p>
      </header>
      <div className="flex-1 flex flex-row p-4 gap-4 overflow-hidden">
        <div className="hidden md:flex flex-col w-64 flex-shrink-0">
          <Toolbar />
        </div>
        <main className="flex-1 flex items-center justify-center relative min-w-0">
          <canvas
            id="drawing-canvas"
            ref={canvasRef}
            className={cn(
              "w-full h-full bg-white rounded-lg shadow-md border border-brand-text/10 touch-none",
              tool === 'text' ? 'cursor-text' : 'cursor-crosshair'
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          {textInput.visible && (
            <textarea
              autoFocus
              onBlur={handleTextSubmit}
              value={textInput.value}
              onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
              style={{
                position: 'absolute',
                left: textInput.x,
                top: textInput.y,
                color: color,
                fontSize: `${strokeWidth}px`,
                lineHeight: 1.2,
              }}
              className="bg-transparent border border-dashed border-brand-text/50 focus:outline-none p-1 resize-none font-sans"
            />
          )}
        </main>
        {isMobile && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="fixed bottom-4 right-4 z-10 h-14 w-14 rounded-full shadow-lg bg-card"
              >
                <PanelTopOpen className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card">
              <div className="mx-auto w-full max-w-sm p-4">
                <DrawerHeader>
                  <DrawerTitle>Tools</DrawerTitle>
                </DrawerHeader>
                <Toolbar />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}