import blessed from "blessed";

type Bit = 1 | 0;

export interface CPUInterface {
  createFrameBuffer(): void;
  drawPixel(x: number, y: number, bit: Bit): boolean;
  clearDisplay(): void;
}

export class TerminalInterface implements CPUInterface {
  public width: 64;
  public height: 32;
  public buffer: Bit[][] = [];
  private blessed = blessed;
  private screen = this.blessed.screen({ smartCSR: true });

  constructor() {
    this.createFrameBuffer();
  }

  public createFrameBuffer() {
    for (let x = 0; x < this.width; x++) {
      this.buffer.push([]);
      for (let y = 0; x < this.height; y++) {
        this.buffer[x].push(0);
      }
    }
  }
  public clearDisplay() {
    this.createFrameBuffer();
    this.screen.clearRegion(0, this.width, 0, this.height);
  }
  public drawPixel(x: number, y: number, bit: Bit): boolean {
    const coord = this.buffer[y][x];
    const collision = coord & bit;
    this.buffer[y][x] ^= bit;

    // Pixel present
    if (this.buffer[y][x]) {
      this.screen.fillRegion("", "█", x, x + 1, y, y + 1);
    } else {
      this.screen.clearRegion(x, x + 1, y, y + 1);
    }

    this.screen.render();

    return Boolean(collision);
  }
}
