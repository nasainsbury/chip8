import blessed from "blessed";

type Bit = 1 | 0;

const keyMap: { [key: string]: number } = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  q: 4,
  w: 5,
  e: 6,
  r: 7,
  a: 8,
  s: 9,
  d: 10,
  f: 11,
  z: 12,
  x: 13,
  c: 14,
  v: 15,
};

export interface CPUInterface {
  createFrameBuffer(): void;
  drawPixel(x: number, y: number, bit: Bit): boolean;
  clearDisplay(): void;
  getKeys(): number;
}

export class TerminalInterface implements CPUInterface {
  public width = 64;
  public height = 32;
  public buffer: Bit[][] = [];
  private blessed = blessed;
  private color = this.blessed.colors.match("#fff");
  private screen = this.blessed.screen({ smartCSR: true, dockBorders: true });
  private keys: number = 0;
  private key: number | undefined;

  constructor() {
    this.createFrameBuffer();

    this.screen.key(["escape", "C-c"], () => {
      process.exit(0);
    });

    this.screen.on("keypress", (_, key) => {
      if (keyMap[key.full] > -1) {
        const index: number = keyMap[key.full];
        /**
         * this.keys = 0b0000000000000000
         * multiple keys can be pressed at once
         * each bit represents whether that key is pressed
         * i.e 0b1100000000000000 would represent "v" and "c" being pressed
         * this shifts bit to left by the index to be used as a max
         */
        const keyMask = 1 << index;
        this.keys |= keyMask;
        this.key = index;
      }
    });

    setInterval(() => {
      // Emulate a keyup event to clear all pressed keys
      this.keys = 0;
      this.key = undefined;
    }, 300);
  }

  public getKeys() {
    return this.keys;
  }
  public getKey() {
    return this.key;
  }
  public createFrameBuffer() {
    const buffer: Bit[][] = [];
    for (let i = 0; i < this.width; i++) {
      buffer.push([]);
      for (let j = 0; j < this.height; j++) {
        buffer[i].push(0);
      }
    }
    this.buffer = buffer;
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
      this.screen.fillRegion(this.color, " ", x, x + 1, y, y + 1);
    } else {
      this.screen.clearRegion(x, x + 1, y, y + 1);
    }

    this.screen.render();

    return Boolean(collision);
  }
}
