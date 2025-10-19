import type { Drawable, Point } from '@/hooks/use-drawing-store';
function smoothPoints(points: Point[]): string {
  if (points.length < 2) {
    return points.length === 1 ? `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}` : "";
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    path += ` Q ${p1.x},${p1.y} ${midPoint.x},${midPoint.y}`;
  }
  path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
  return path;
}
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
type SvgParts = {
  element: string;
  definition?: string;
};
function drawableToSvgParts(drawable: Drawable, gradientId: number): SvgParts {
  if (drawable.type === 'text') {
    const commonProps = `fill="${drawable.color}" font-size="${drawable.fontSize}px" font-family="Inter, sans-serif"`;
    const lines = drawable.content.split('\n');
    const tspans = lines.map((line, index) =>
      `<tspan x="${drawable.position.x}" dy="${index === 0 ? 0 : '1.2em'}">${escapeHtml(line)}</tspan>`
    ).join('');
    return { element: `<text x="${drawable.position.x}" y="${drawable.position.y}" ${commonProps}>${tspans}</text>` };
  }
  const stroke = drawable.strokeWidth > 0 ? `stroke="${drawable.color}" stroke-width="${drawable.strokeWidth}"` : 'stroke="none"';
  switch (drawable.type) {
    case 'freehand': {
      if (drawable.points.length === 0) return { element: '' };
      const d = smoothPoints(drawable.points);
      return { element: `<path d="${d}" ${stroke} fill="none" stroke-linecap="round" stroke-linejoin="round" />` };
    }
    case 'line': {
      return { element: `<line x1="${drawable.start.x}" y1="${drawable.start.y}" x2="${drawable.end.x}" y2="${drawable.end.y}" ${stroke} stroke-linecap="round" />` };
    }
    case 'rectangle': {
      const x = Math.min(drawable.start.x, drawable.end.x);
      const y = Math.min(drawable.start.y, drawable.end.y);
      const width = Math.abs(drawable.start.x - drawable.end.x);
      const height = Math.abs(drawable.start.y - drawable.end.y);
      let fillAttr = 'fill="none"';
      let definition;
      if (drawable.fill.type === 'solid') {
        fillAttr = `fill="${drawable.fill.color}"`;
      } else if (drawable.fill.type === 'linear-gradient') {
        const id = `grad-${gradientId}`;
        fillAttr = `fill="url(#${id})"`;
        definition = `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${drawable.fill.color1}" /><stop offset="100%" style="stop-color:${drawable.fill.color2}" /></linearGradient>`;
      }
      return { element: `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${stroke} ${fillAttr} stroke-linejoin="round" />`, definition };
    }
    case 'circle': {
      let fillAttr = 'fill="none"';
      let definition;
      if (drawable.fill.type === 'solid') {
        fillAttr = `fill="${drawable.fill.color}"`;
      } else if (drawable.fill.type === 'linear-gradient') {
        const id = `grad-${gradientId}`;
        fillAttr = `fill="url(#${id})"`;
        definition = `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${drawable.fill.color1}" /><stop offset="100%" style="stop-color:${drawable.fill.color2}" /></linearGradient>`;
      }
      return { element: `<circle cx="${drawable.center.x}" cy="${drawable.center.y}" r="${drawable.radius}" ${stroke} ${fillAttr} />`, definition };
    }
    default:
      return { element: '' };
  }
}
export function convertDrawablesToSvg(drawables: Drawable[], width: number, height: number): string {
  let gradientCounter = 0;
  const definitions: string[] = [];
  const elements: string[] = [];
  drawables.forEach(drawable => {
    if (drawable.type === 'rectangle' || drawable.type === 'circle') {
      if (drawable.fill.type === 'linear-gradient') {
        gradientCounter++;
      }
    }
    const { element, definition } = drawableToSvgParts(drawable, gradientCounter);
    if (element) elements.push(element);
    if (definition) definitions.push(definition);
  });
  const defsString = definitions.length > 0 ? `\n  <defs>\n    ${definitions.join('\n    ')}\n  </defs>` : '';
  const elementsString = elements.join('\n  ');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${defsString}
  ${elementsString}
</svg>`;
}
export function downloadSvg(svgString: string, filename: string = 'drawing.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}