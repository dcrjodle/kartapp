/**
 * Hand-drawn stroke utilities for creating sketched, organic-looking SVG paths
 * Generates irregular, hand-drawn appearance for map borders and city patterns
 */

/**
 * Configuration for hand-drawn stroke generation
 */
interface HandDrawnConfig {
  /** Maximum deviation from original path (0-1) */
  roughness: number;
  /** Number of deviation points per unit length */
  bowing: number;
  /** Stroke width variation (0-1) */
  strokeVariation: number;
  /** Random seed for consistent results */
  seed: number;
}

/**
 * Default configuration for hand-drawn strokes
 */
const DEFAULT_CONFIG: HandDrawnConfig = {
  roughness: 0.3,
  bowing: 0.8,
  strokeVariation: 0.2,
  seed: 1,
};

/**
 * Simple seeded random number generator for consistent results
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Adds roughness to a single point
 */
function roughenPoint(
  x: number,
  y: number,
  roughness: number,
  random: SeededRandom
): [number, number] {
  const deviation = roughness * 2;
  const dx = random.range(-deviation, deviation);
  const dy = random.range(-deviation, deviation);
  return [x + dx, y + dy];
}

/**
 * Generates hand-drawn variation of an SVG path
 */
export function generateHandDrawnPath(
  originalPath: string,
  config: Partial<HandDrawnConfig> = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = new SeededRandom(cfg.seed);
  
  // Parse the SVG path to extract coordinates
  const pathCommands: string[] = originalPath.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  
  let handDrawnPath = '';
  
  pathCommands.forEach((command: string) => {
    if (!command || command.length === 0) return;
    const cmd = command[0];
    const coords = command.slice(1).trim();
    
    if (cmd === 'M' || cmd === 'L') {
      const [x, y] = coords.split(/[,\s]+/).map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        const [roughX, roughY] = roughenPoint(x, y, cfg.roughness, random);
        handDrawnPath += `${cmd}${roughX.toFixed(2)},${roughY.toFixed(2)}`;
      }
    } else if (cmd === 'C') {
      const coordArray = coords.split(/[,\s]+/).map(Number);
      if (coordArray.length === 6) {
        const roughCoords = [];
        for (let i = 0; i < 6; i += 2) {
          const [roughX, roughY] = roughenPoint(coordArray[i], coordArray[i + 1], cfg.roughness, random);
          roughCoords.push(roughX.toFixed(2), roughY.toFixed(2));
        }
        handDrawnPath += `${cmd}${roughCoords.join(',')}`;
      }
    } else {
      // For other commands, pass through unchanged
      handDrawnPath += command;
    }
  });
  
  return handDrawnPath;
}

/**
 * Generates stroke-dasharray for hand-drawn effect
 */
export function generateHandDrawnDashArray(
  length: number,
  config: Partial<HandDrawnConfig> = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = new SeededRandom(cfg.seed);
  
  const segments = [];
  let remaining = length;
  
  while (remaining > 0) {
    const dashLength = random.range(3, 8);
    const gapLength = random.range(1, 3);
    
    segments.push(Math.min(dashLength, remaining));
    remaining -= dashLength;
    
    if (remaining > 0) {
      segments.push(Math.min(gapLength, remaining));
      remaining -= gapLength;
    }
  }
  
  return segments.join(',');
}

/**
 * Generates architectural grid pattern for cities with aligned cells
 */
export function generateCityGridPattern(
  x: number,
  y: number,
  complexity: number,
  config: Partial<HandDrawnConfig> = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = new SeededRandom(cfg.seed + x + y); // Use position as additional seed
  
  const elements = [];
  const gridSize = 16; // Total grid area size
  const minCellSize = 2;
  const maxCellSize = 4;
  const gap = 0.5; // Gap between cells
  
  // Generate grid with random cell sizes that align
  const cells = [];
  let currentY = y - gridSize / 2;
  
  while (currentY < y + gridSize / 2) {
    let currentX = x - gridSize / 2;
    const rowHeight = random.range(minCellSize, maxCellSize);
    
    while (currentX < x + gridSize / 2) {
      const cellWidth = random.range(minCellSize, maxCellSize);
      
      // Only add cell if we have enough complexity/population
      if (cells.length < complexity) {
        cells.push({
          x: currentX + gap,
          y: currentY + gap,
          width: cellWidth - gap * 2,
          height: rowHeight - gap * 2
        });
      }
      
      currentX += cellWidth;
    }
    
    currentY += rowHeight;
  }
  
  // Create rectangles for each cell
  cells.forEach(cell => {
    elements.push(
      `<rect x="${cell.x.toFixed(1)}" y="${cell.y.toFixed(1)}" ` +
      `width="${cell.width.toFixed(1)}" height="${cell.height.toFixed(1)}" ` +
      `fill="currentColor" fill-opacity="0.7" stroke="currentColor" stroke-width="0.3"/>`
    );
  });
  
  return elements.join('');
}

/**
 * Gets city complexity based on population
 */
export function getCityComplexity(population: number): number {
  if (population >= 500000) return 16; // Major cities
  if (population >= 200000) return 12; // Large cities
  if (population >= 100000) return 8;  // Medium cities
  return 4; // Small cities
}

/**
 * Generates hand-drawn stroke width with variation
 */
export function generateVariableStrokeWidth(
  baseWidth: number,
  config: Partial<HandDrawnConfig> = {}
): number {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = new SeededRandom(cfg.seed);
  
  const variation = cfg.strokeVariation * baseWidth;
  return baseWidth + random.range(-variation, variation);
}