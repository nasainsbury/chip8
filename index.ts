import { CPU } from "./cpu";
import { TerminalInterface } from "./interfaces/terminal";

import fs from "fs";
const fileContents = fs.readFileSync("./rom/BLINKY");

const cpu = new CPU(new TerminalInterface());

cpu.load(fileContents);

function cycle() {
  cpu.step();

  setTimeout(cycle, 1);
}

cycle();
