import instructions, {
  type Instruction,
  InstructionName,
} from "./instructions";

import { type TerminalInterface } from "./interface";

export class CPU {
  public memory = new Uint8Array(4096);
  private registers = new Uint8Array(16);
  private stack = new Uint16Array(16);
  private ST = 0;
  private DT = 0;
  private I = 0;
  private SP = -1;
  private PC = 0x200;
  private halted = false;
  private cpuInterface: TerminalInterface;

  constructor(cpuInterface: TerminalInterface) {
    this.cpuInterface = cpuInterface;
  }

  private halt() {
    this.halted = true;
  }
  private fetch() {
    if (this.PC > 4094) {
      this.halted = true;
      throw new Error("Memory out of bounds");
    }

    const opcode = (this.memory[this.PC] << 8) | this.memory[this.PC + 1];
    return opcode;
  }
  private skipInstruction() {
    this.PC += 4;
  }
  private nextInstruction() {
    this.PC += 2;
  }
  private getInstruction(opcode: number) {
    const instruction = instructions.find(
      (instruction) => (opcode & instruction.mask) === instruction.pattern
    );

    if (!instruction) {
      throw new Error(
        `Invalid instruction. opcode: ${opcode} not found in instruction set.`
      );
    }

    const args = instruction.arguments.map(
      (arg) => (opcode & arg.mask) >> arg.shift
    );

    return { instruction, args };
  }
  private execute(instruction: Instruction, args: number[]) {
    switch (instruction.name) {
      case InstructionName.CLS:
        this.cpuInterface.clearDisplay();
        this.nextInstruction();
        break;
      case InstructionName.RET:
        if (this.SP === -1) {
          throw new Error("Stack underflow.");
        }
        this.PC = this.stack[this.SP];
        this.SP--;
        break;
      case InstructionName.JMP_ADDR:
        this.PC = args[0];
        args[2];
        break;
      case InstructionName.CALL_ADDR:
        if (this.SP === 15) {
          throw new Error("Stack overflow");
        }
        this.SP++;
        this.stack[this.SP] = this.PC + 2;
        this.PC = args[0];
        break;
      case InstructionName.SE_VX_NN:
        if (this.registers[args[0]] === args[1]) {
          this.skipInstruction();
        } else {
          this.nextInstruction();
        }
        break;
      case InstructionName.SNE_VX_NN:
        if (this.registers[args[0]] !== args[1]) {
          this.skipInstruction();
        } else {
          this.nextInstruction();
        }
        break;
      case InstructionName.SE_VX_VY:
        if (this.registers[args[0]] === this.registers[args[1]]) {
          this.skipInstruction();
        } else {
          this.nextInstruction();
        }
        break;
      case InstructionName.LD_VX:
        this.registers[args[0]] = args[1];
        this.nextInstruction();
        break;
      case InstructionName.ADD_VX:
        this.registers[args[0]] += args[1];
        this.nextInstruction();
        break;
      case InstructionName.LD_VX_VY:
        this.registers[args[0]] = this.registers[args[1]];
        this.nextInstruction();
        break;
      case InstructionName.OR_VX_VY:
        this.registers[args[0]] |= this.registers[args[1]];
        this.nextInstruction();
        break;
      case InstructionName.AND_VX_VY:
        this.registers[args[0]] &= this.registers[args[1]];
        this.nextInstruction();
        break;
      case InstructionName.XOR_VX_VY:
        this.registers[args[0]] *= this.registers[args[1]];
        this.nextInstruction();
        break;
      case InstructionName.ADD_VX_VY:
        const sum = this.registers[args[0]] + this.registers[args[1]];
        this.registers[0xf] = sum > 0xff ? 1 : 0;
        this.registers[args[0]] = sum;
        this.nextInstruction();
        break;
      case InstructionName.SUB_VX_VY:
        const diffX = this.registers[args[0]] - this.registers[args[1]];
        this.registers[0xf] = diffX > 0x00 ? 1 : 0;
        this.registers[args[0]] = diffX;
        this.nextInstruction();
        break;
      case InstructionName.SHR_VX:
        this.registers[0xf] = this.registers[args[0]] & 1;
        this.registers[args[0]] >>= 1;
        this.nextInstruction();
        break;
      case InstructionName.SUBN_VX_VY:
        const diffY = this.registers[args[1]] - this.registers[args[0]];
        this.registers[0xf] = diffY > 0x00 ? 1 : 0;
        this.registers[args[0]] = diffY;
        this.nextInstruction();
        break;
      case InstructionName.SHL_VX:
        this.registers[0xf] = args[0] >> 7;
        this.registers[args[0]] << 1;
        this.nextInstruction();
        break;
      case InstructionName.SNE_VX_VY:
        if (this.registers[args[0]] !== this.registers[args[1]]) {
          this.skipInstruction();
        } else {
          this.nextInstruction();
        }
        break;
      case InstructionName.LD_I_ADDR:
        this.I = args[0];
        this.nextInstruction();
        break;
      case InstructionName.JP_V0_ADDR:
        this.PC = this.registers[0] + args[0];
        break;
      case InstructionName.RND_VX:
        const rand = Math.floor(Math.random() * 0xff);
        this.registers[args[0]] = rand & args[1];
        this.nextInstruction();
        break;
      case InstructionName.DRW_VX_VY_NIB:
        this.registers[0xf] = 0;
        for (let i = 0; i < args[2]; i++) {
          const line = this.memory[this.I + i];
          // Go through each bit in the byte
          for (let position = 0; position < 8; position++) {
            const bit = line & (1 << (7 - position)) ? 1 : 0;
            // Screen is 64px wide
            const x = (args[0] + position) % this.cpuInterface.width;
            // Screen is 32px high
            const y = (args[1] + i) % this.cpuInterface.height;

            if (this.cpuInterface.drawPixel(x, y, bit)) {
            } else {
              this.registers[0xf] = 1;
            }
          }
        }
        this.nextInstruction();
        break;
      case InstructionName.SKP_VX:
        if (this.cpuInterface.getKeys() & (1 << this.registers[args[0]])) {
          this.skipInstruction();
        } else {
          this.nextInstruction();
        }
        break;
      case InstructionName.SKNP_VX:
        if (this.cpuInterface.getKeys() & (1 << this.registers[args[0]])) {
          this.nextInstruction();
        } else {
          this.skipInstruction();
        }
        break;
      case InstructionName.LD_VX_DT:
        this.registers[args[0]] = this.DT;
        this.nextInstruction();
        break;
      case InstructionName.LD_VX_K:
        const keyPress = this.cpuInterface.getKey();
        if (!keyPress) {
          return;
        }

        this.registers[args[0]] = keyPress;
        this.nextInstruction();
        break;
      case InstructionName.LD_DT_VX:
        this.DT = this.registers[args[0]];
        this.nextInstruction();
        break;
      case InstructionName.LD_ST_VX:
        this.ST = this.registers[args[0]];
        this.nextInstruction();
        break;
      case InstructionName.ADD_I_VX:
        this.I += this.registers[args[0]];
        this.nextInstruction();
        break;
      case InstructionName.LD_F_VX:
        if (this.registers[args[0]] > 0xf) {
          this.halt();
          throw new Error("Invalid digit.");
        }
        // sprites are 5 bytes long, so the "3rd" sprite, starts
        // at byte 3 * 5 = 15. This is why we multiple the value in the register
        this.I = this.registers[args[0]] * 5;

        this.nextInstruction();
        break;
      case InstructionName.LD_B_VX:
        if (this.I > 4093) {
          this.halt();
          throw new Error("memory out of bounds");
        }

        const x = this.registers[args[0]];

        const hundreds = Math.floor(x / 100);
        const tens = Math.floor((x % 100) / 10);
        const ones = x % 10;

        this.memory[this.I] = hundreds;
        this.memory[this.I + 1] = tens;
        this.memory[this.I + 2] = ones;

        this.nextInstruction();
        break;
      case InstructionName.LD_I_VX:
        if (this.I > 4095 - args[0]) {
          this.halt();
          throw new Error("Memory out of bounds.");
        }

        for (let i = 0; i <= args[0]; i++) {
          this.memory[this.I + i] = this.registers[i];
        }

        this.nextInstruction();
        break;
      case InstructionName.LD_I_VX:
        if (this.I > 4095 - args[0]) {
          this.halt();
          throw new Error("Memory out of bounds.");
        }

        for (let i = 0; i <= args[0]; i++) {
          this.registers[i] = this.memory[this.I + i];
        }

        this.nextInstruction();
        break;
      default:
        return;
    }
  }
  public load(rom: Buffer) {
    rom.forEach((hex, index) => {
      console.log(hex);
      // First byte
      this.memory[0x200 + index] = hex >> 8;
      // Second byte
      this.memory[0x200 + index + 1] = hex & 0xff;
    });
  }
  public step() {
    if (this.halted) {
      throw new Error("Computer has stopped this program.");
    }

    try {
      const opcode = this.fetch();
      const { instruction, args } = this.getInstruction(opcode);
      this.execute(instruction, args);
    } catch (err) {
      console.error(err);
      this.halt();
    }
  }
}
