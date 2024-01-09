import blessed from "blessed";

type Bit = 1 | 0;
const keyMap = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']

export interface CPUInterface {
  createFrameBuffer(): void;
  drawPixel(x: number, y: number, bit: Bit): boolean;
  clearDisplay(): void;
}

export class TerminalInterface implements CPUInterface {
  public width = 64;
  public height = 32;
  public buffer: Bit[][] = [];
  private blessed = blessed;
  private color = this.blessed.colors.match("#FFF");
  private screen = this.blessed.screen({ smartCSR: true });
  private key: string | undefined;

  constructor() {
    this.createFrameBuffer();

    this.screen.on('keypress', (_,key) => {
      this.key = key.full;
    });

    setInterval(() => {
      // Emulate a keyup event to clear all pressed keys
      this.key = undefined;
    }, 100)
  }



  public createFrameBuffer() {
    for (let x = 0; x < this.width; x++) {
      const row = []
      for (let y = 0; y < this.height; y++) {
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
      console.log("cool");
      this.screen.fillRegion(this.color, "█", x, x + 1, y, y + 1);
    } else {
      this.screen.clearRegion(x, x + 1, y, y + 1);
    }

    this.screen.render();

    return Boolean(collision);
  }
}
