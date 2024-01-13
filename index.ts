import { CPU } from "./cpu";
import { TerminalInterface } from "./interface";

import fs from 'fs';
const fileContents = fs.readFileSync('./WALL');

const cpu = new CPU(new TerminalInterface());

cpu.load(fileContents);

function cycle() {
  cpu.step()

  setTimeout(cycle, 0.1)
}

cycle()