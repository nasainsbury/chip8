import instructions, {
  type Instruction,
  InstructionName,
} from "./instructions";

import { type TerminalInterface } from "./interface";

class CPU {
  private memory = new Uint8Array(4096);
  private registers = new Uint8Array(16);
  private stack = new Uint16Array(16);
  private ST = 0;
  private DT = 0;
  private I = 0;
  private SP = -1;
  private PC = 0x200;
  private cpuInterface: TerminalInterface;

  constructor(cpuInterface: TerminalInterface) {
    this.cpuInterface = cpuInterface;
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
      case InstructionName.ADD_VX:
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
      default:
        return;
    }
  }
}
