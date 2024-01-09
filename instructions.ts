export type Instruction = {
  name: InstructionName;
  mask: number;
  pattern: number;
  arguments: Array<{ mask: number; shift: number }>;
};

export enum InstructionName {
  CLS,
  RET,
  JMP_ADDR,
  CALL_ADDR,
  SE_VX_NN,
  SNE_VX_NN,
  SE_VX_VY,
  LD_VX,
  ADD_VX,
  LD_VX_VY,
  OR_VX_VY,
  AND_VX_VY,
  XOR_VX_VY,
  ADD_VX_VY,
  SUB_VX_VY,
  SHR_VX,
  SUBN_VX_VY,
  SHL_VX,
  SNE_VX_VY,
  LD_I_ADDR,
  JP_V0_ADDR,
  RND_VX,
  DRW_VX_VY_NIB,
  SKP_VX
}

const instructions: Instruction[] = [
  {
    name: InstructionName.CLS,
    mask: 0xffff,
    pattern: 0x00e0,
    arguments: [],
  },
  {
    name: InstructionName.RET,
    mask: 0xffff,
    pattern: 0x00ee,
    arguments: [],
  },
  {
    name: InstructionName.JMP_ADDR,
    mask: 0xf000,
    pattern: 0x1000,
    arguments: [{ mask: 0x0fff, shift: 0 }],
  },
  {
    name: InstructionName.CALL_ADDR,
    mask: 0xf000,
    pattern: 0x2000,
    arguments: [{ mask: 0x0fff, shift: 0 }],
  },
  {
    name: InstructionName.SE_VX_NN,
    mask: 0xf000,
    pattern: 0x3000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00ff, shift: 0 },
    ],
  },
  {
    name: InstructionName.SNE_VX_NN,
    mask: 0xf000,
    pattern: 0x4000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00ff, shift: 0 },
    ],
  },
  {
    name: InstructionName.SNE_VX_NN,
    mask: 0xf00f,
    pattern: 0x5000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.LD_VX,
    mask: 0xf000,
    pattern: 0x6000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00ff, shift: 0 },
    ],
  },
  {
    name: InstructionName.ADD_VX,
    mask: 0xf000,
    pattern: 0x7000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00ff, shift: 0 },
    ],
  },
  {
    name: InstructionName.LD_VX_VY,
    mask: 0xf00f,
    pattern: 0x8000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.OR_VX_VY,
    mask: 0xf00f,
    pattern: 0x8001,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.AND_VX_VY,
    mask: 0xf00f,
    pattern: 0x8002,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.XOR_VX_VY,
    mask: 0xf00f,
    pattern: 0x8003,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.ADD_VX_VY,
    mask: 0xf00f,
    pattern: 0x8004,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.SUB_VX_VY,
    mask: 0xf00f,
    pattern: 0x8005,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.SHR_VX,
    mask: 0xf00f,
    pattern: 0x8006,
    arguments: [{ mask: 0x0f00, shift: 8 }],
  },
  {
    name: InstructionName.SUBN_VX_VY,
    mask: 0xf00f,
    pattern: 0x8007,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.SHL_VX,
    mask: 0xf00f,
    pattern: 0x800e,
    arguments: [{ mask: 0x0f00, shift: 8 }],
  },
  {
    name: InstructionName.SHL_VX,
    mask: 0xf00f,
    pattern: 0x9000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
  },
  {
    name: InstructionName.LD_I_ADDR,
    mask: 0xf000,
    pattern: 0xa000,
    arguments: [{ mask: 0x0fff, shift: 0 }],
  },
  {
    name: InstructionName.JP_V0_ADDR,
    mask: 0xf000,
    pattern: 0xb000,
    arguments: [{ mask: 0x0fff, shift: 0 }],
  },
  {
    name: InstructionName.RND_VX,
    mask: 0xf000,
    pattern: 0xc000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00ff, shift: 0 },
    ],
  },
  {
    name: InstructionName.DRW_VX_VY_NIB,
    mask: 0xf000,
    pattern: 0xd000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
      { mask: 0x000f, shift: 0 },
    ],
  },
  {
    name: InstructionName.SKP_VX,
    mask: 0xf0ff,
    pattern: 0xe09e,
    arguments: [
      { mask: 0x0f00, shift: 8 },
    ],
  },
];

export default instructions;
