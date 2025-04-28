import React, { useState } from "react";
import Debugger from "./Debugger";
import DropArea from "./Drop";
import "../styles/MIPS.css";
import RAMtable from "./RAMtable";
import REGISTERtable from "./REGISTERtable";
import CircuitImage from "./Circuit";
import { checkOverflow } from "../utils/Overflow";

const initialRegisters = {
  zero: 0,
  at: 0,
  v0: 0,
  v1: 0,
  a0: 0,
  a1: 0,
  a2: 0,
  a3: 0,
  t0: 0,
  t1: 0,
  t2: 0,
  t3: 0,
  t4: 0,
  t5: 0,
  t6: 0,
  t7: 0,
  s0: 0,
  s1: 0,
  s2: 0,
  s3: 0,
  s4: 0,
  s5: 0,
  s6: 0,
  s7: 0,
  t8: 0,
  t9: 0,
  k0: 0,
  k1: 0,
  gp: 0,
  sp: 0,
  fp: 0,
  ra: 0,
};

const initialMemory = Array.from({ length: 32 }).reduce(
  (acc, curr, i) => ({ ...acc, [i]: 0 }),
  {}
);

const MIPS = () => {
  const [mipsInput, setMipsInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [registers, setRegisters] = useState(initialRegisters);
  const [memory, setMemory] = useState(initialMemory);
  const [PC, setPC] = useState(0);
  const [history, setHistory] = useState([]);
  const instructions = mipsInput.trim().split("\n");
  const currentInstruction = instructions[PC] || "";
  const [errorMessage, setErrorMessage] = useState("");

  const updateTables = (newRegisters, newMemory) => {
    setRegisters(newRegisters);
    setMemory(newMemory);
  };

  const simulateMIPS = () => {
    document
      .getElementById("simulation-tables")
      .scrollIntoView({ behavior: "smooth" });

    const hexInstructions = mipsInput.trim().split("\n");
    resetMIPS();

    const newRegisters = { ...initialRegisters };
    const newMemory = { ...initialMemory };
    let pc = 0;

    while (pc < hexInstructions.length) {
      const newPC = executeMIPSInstruction(
        hexInstructions[pc],
        newRegisters,
        newMemory,
        pc,
        setErrorMessage
      );
      if (newPC !== undefined) {
        pc = newPC;
      } else {
        pc += 1;
      }
    }

    updateTables(newRegisters, newMemory);
  };

  const stepMIPS = () => {
    const instructions = mipsInput.trim().split("\n");
    if (PC >= instructions.length) return;
    setHistory([
      ...history,
      { PC, registers: { ...registers }, memory: { ...memory } },
    ]);

    const newRegisters = { ...registers };
    const newMemory = { ...memory };
    const newPC = executeMIPSInstruction(
      instructions[PC],
      newRegisters,
      newMemory,
      PC,
      setErrorMessage
    );

    if (newPC !== undefined) {
      console.log(newPC);
      setPC(newPC);
    } else {
      setPC(PC + 1);
    }

    updateTables(newRegisters, newMemory);
  };

  const stepBackMIPS = () => {
    if (PC === 0) return;

    const lastHistoryIndex = history.length - 1;
    const lastState = history[lastHistoryIndex];

    if (lastState) {
      setPC(lastState.PC);
      setRegisters(lastState.registers);
      setMemory(lastState.memory);
      setHistory(history.slice(0, lastHistoryIndex));
    }
  };

  const resetMIPS = () => {
    setPC(0);
    setHistory([]);
    setRegisters(initialRegisters);
    setMemory(initialMemory);
  };

  return (
    <div>
      {errorMessage && (
        <div
          style={{ color: "red", textAlign: "center", marginBottom: "10px" }}
        >
          {errorMessage}
        </div>
      )}
      <div className="row-container">
        <DropArea setMipsInput={setMipsInput} setHexInput={setHexInput} />
        <textarea
          id="mips-input"
          className="input-text-area"
          placeholder="Enter MIPS instructions here..."
          value={mipsInput}
          onChange={(e) => setMipsInput(e.target.value)}
        />
        <button
          id="simulate-mips-button"
          className="btnSimulate"
          onClick={simulateMIPS}
        >
          Simulate MIPS
        </button>
      </div>
      <CircuitImage
        currentInstruction={currentInstruction}
        registers={registers}
      />
      <div className="bottom-section">
        <RAMtable memory={memory} />
        <Debugger
          PC={PC}
          simulateMIPS={simulateMIPS}
          mipsInput={mipsInput}
          stepMIPS={stepMIPS}
          stepBackMIPS={stepBackMIPS}
          resetMIPS={resetMIPS}
        />
        <REGISTERtable registers={registers} />
      </div>
    </div>
  );
};

function executeMIPSInstruction(
  instruction,
  registers,
  memory,
  PC,
  setErrorMessage
) {
  if (!instruction.trim()) return;

  const [op, ...operandsRaw] = instruction
    .trim()
    .split(/\s+|,/)
    .filter(Boolean);
  const operands = operandsRaw.map((op) => op.trim());

  switch (op) {
    case "add": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) + (registers[rt] || 0);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detected during ADD operation at instruction ${PC}.`
        );
        console.error("Overflow detected in addition operation.");
        registers[rd] = 0;
      } else {
        registers[rd] = result;
      }
      break;
    }
    case "addu": {
      const [rd, rs, rt] = operands;
      registers[rd] = (registers[rs] || 0) + (registers[rt] || 0);
      break;
    }
    case "sub": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) - (registers[rt] || 0);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detected during SUB operation at instruction ${PC}.`
        );
        console.error("Overflow detected in subtraction operation.");
        registers[rd] = 0;
        break;
      } else {
        registers[rd] = result;
        break;
      }
    }
    case "subu": {
      const [rd, rs, rt] = operands;
      registers[rd] = (registers[rs] || 0) - (registers[rt] || 0);
      break;
    }
    case "slt": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
      break;
    }
    case "sltu": {
      const [rd, rs, rt] = operands;
      registers[rd] = unsigned(registers[rs]) < unsigned(registers[rt]) ? 1 : 0;
      break;
    }
    case "and": {
      const [rd, rs, rt] = operands;
      registers[rd] = (registers[rs] || 0) & (registers[rt] || 0);
      break;
    }
    case "or": {
      const [rd, rs, rt] = operands;
      registers[rd] = (registers[rs] || 0) | (registers[rt] || 0);
      break;
    }
    case "nor": {
      const [rd, rs, rt] = operands;
      registers[rd] = ~(registers[rs] | registers[rt]);
      break;
    }
    case "xor": {
      const [rd, rs, rt] = operands;
      registers[rd] = (registers[rs] || 0) ^ (registers[rt] || 0);
      break;
    }
    case "sll": {
      const [rd, rt, shamt] = operands;
      console.log("SLL - Operands:", { rd, rt, shamt });
      console.log("Before SLL - registers[rd]:", registers[rd]);

      // Validar registros y shift amount
      if (!registers.hasOwnProperty(rd) || !registers.hasOwnProperty(rt)) {
        console.error("Invalid register in sll instruction");
        break;
      }

      const shiftAmount = parseInt(shamt);
      if (isNaN(shiftAmount) || shiftAmount < 0 || shiftAmount > 31) {
        console.error("Invalid shift amount in sll instruction");
        break;
      }

      // No modificar el registro $zero
      if (rd === "zero") break;

      // Realizar el desplazamiento lógico a la izquierda
      registers[rd] = (registers[rt] || 0) << shiftAmount;
      console.log("After SLL - registers[rd]:", registers[rd]);
      break;
    }
    case "srl": {
      const [rd, rt, shamt] = operands;
      registers[rd] = registers[rt] >>> parseInt(shamt);
      console.log("After SLL - registers[rt]:", registers[rt]);
      break;
    }
    case "sra": {
      const [rd, rt, shamt] = operands;
      registers[rd] = registers[rt] >> parseInt(shamt);
      console.log("After SLL - registers[rt]:", registers[rt]);
      break;
    }
    case "jr": {
      const [rs] = operands;
      console.log("After SLL - registers[rd]:", registers[rd]);
      return registers[rs] || 0;
    }

    case "addi": {
      const [rt, rs, immediate] = operands;
      const result = (registers[rs] || 0) + parseImmediate(immediate);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detected during ADDI operation at instruction ${PC}.`
        );
        console.error("Overflow detected in ADDI operation.");
        registers[rt] = 0; // opcional: podrías no modificarlo si prefieres
        break;
      } else {
        registers[rt] = result;
        break;
      }
    }
    case "addiu": {
      const [rt, rs, immediate] = operands;
      registers[rt] = (registers[rs] || 0) + parseImmediate(immediate);
      break;
    }
    case "andi": {
      const [rt, rs, immediate] = operands;
      registers[rt] = (registers[rs] || 0) & parseImmediate(immediate);
      break;
    }
    case "ori": {
      const [rt, rs, immediate] = operands;
      registers[rt] = (registers[rs] || 0) | parseImmediate(immediate);
      break;
    }
    case "xori": {
      const [rt, rs, immediate] = operands;
      registers[rt] = (registers[rs] || 0) ^ parseImmediate(immediate);
      break;
    }
    case "lui": {
      const [rt, immediate] = operands;
      registers[rt] = parseImmediate(immediate) << 16;
      break;
    }
    case "slti": {
      const [rt, rs, immediate] = operands;
      registers[rt] = registers[rs] < parseImmediate(immediate) ? 1 : 0;
      break;
    }
    case "sltiu": {
      const [rt, rs, immediate] = operands;
      registers[rt] =
        unsigned(registers[rs]) < unsigned(parseImmediate(immediate)) ? 1 : 0;
      break;
    }
    case "lw": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;
        registers[rt] = memory[address] ?? 0;
      }
      break;
    }
    case "sw": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;
        memory[address] = registers[rt] ?? 0;
      }
      break;
    }
    case "beq": {
      const [rs, rt, offset] = operands;
      if (registers[rs] === registers[rt]) {
        return PC + parseImmediate(offset);
      }
      break;
    }
    case "bne": {
      const [rs, rt, offset] = operands;
      if (registers[rs] !== registers[rt]) {
        return PC + parseImmediate(offset);
      }
      break;
    }

    // J-Type instructions
    case "j": {
      const [address] = operands;
      return parseImmediate(address);
    }
    case "jal": {
      const [address] = operands;
      registers["ra"] = PC + 1; // Save next instruction in $ra
      return parseImmediate(address);
    }

    default: {
      console.error("Unsupported operation:", op);
      break;
    }
  }
}

// Funciones auxiliares
function parseImmediate(value) {
  if (typeof value === "string" && value.startsWith("0x")) {
    return parseInt(value, 16);
  }
  return parseInt(value, 10);
}

function unsigned(val) {
  return val >>> 0;
}

export default MIPS;
