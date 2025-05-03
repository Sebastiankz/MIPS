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

// Inicializar la memoria con 256 posiciones con valor 0
const initialMemory = Array.from({ length: 256 }).reduce(
  (acc, _, i) => ({ ...acc, [i]: 0 }),
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
    console.log("Actualizando tablas:", {
      registers: newRegisters,
      memory: newMemory,
    });
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

    // Guardar estado actual para step back
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
      console.log(`Salto a PC: ${newPC}`);
      setPC(newPC);
    } else {
      setPC(PC + 1);
    }

    updateTables(newRegisters, newMemory);
  };

  const stepBackMIPS = () => {
    if (PC === 0 || history.length === 0) return;

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
    setErrorMessage("");
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

  console.log(`Ejecutando: ${op} con operandos:`, operands);

  switch (op.toLowerCase()) {
    // Operaciones aritméticas básicas
    case "add": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) + (registers[rt] || 0);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante ADD operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación add.");
        registers[rd] = 0;
      } else {
        registers[rd] = result;
        console.log(
          `ADD: ${rs}(${registers[rs]}) + ${rt}(${registers[rt]}) = ${result}, guardado en ${rd}`
        );
      }
      break;
    }
    case "addu": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) + (registers[rt] || 0);

      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante ADDU operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación addu.");
        registers[rd] = 0;
      } else {
        registers[rd] = result;
        console.log(
          `ADDU: ${rs}(${registers[rs]}) + ${rt}(${registers[rt]}) = ${result}, guardado en ${rd}`
        );
      }
      break;
    }
    case "sub": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) - (registers[rt] || 0);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante SUB operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación de resta.");
        registers[rd] = 0;
      } else {
        registers[rd] = result;
        console.log(`SUB: resultado en ${rd} = ${registers[rd]}`);
      }
      break;
    }
    case "subu": {
      const [rd, rs, rt] = operands;
      const result = (registers[rs] || 0) - (registers[rt] || 0);
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante SUBU operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación de resta.");
        registers[rd] = 0;
      } else {
        registers[rd] = result;
        console.log(`SUBU: resultado en ${rd} = ${registers[rd]}`);
      }
      break;
    }

    // Operaciones aritméticas inmediatas
    case "addi": {
      const [rt, rs, immediate] = operands;
      const imm = parseImmediate(immediate);
      const result = (registers[rs] || 0) + imm;
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante ADDI operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación ADDI.");
        registers[rt] = 0;
      } else {
        registers[rt] = result;
        console.log(
          `ADDI: ${rs}(${registers[rs]}) + ${imm} = ${result}, guardado en ${rt}`
        );
      }
      break;
    }
    case "addiu": {
      const [rt, rs, immediate] = operands;
      const imm = parseImmediate(immediate);
      const result = (registers[rs] || 0) + imm;
      if (checkOverflow(result)) {
        setErrorMessage(
          `Overflow detectado durante ADDIU operation en instrucción ${PC}.`
        );
        console.error("Overflow detectado en operación ADDIU.");
        registers[rt] = 0;
      } else {
        registers[rt] = result;
        console.log(
          `ADDIU: ${rs}(${registers[rs]}) + ${imm} = ${result}, guardado en ${rt}`
        );
      }
      break;
    }

    // Operaciones de acceso a memoria - word
    case "lw": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;

        if (address < 0 || address >= Object.keys(memory).length) {
          setErrorMessage(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          console.error(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          break;
        }

        registers[rt] = memory[address] || 0;
        console.log(
          `LW: Cargando valor ${memory[address]} desde dirección ${address} a registro ${rt}`
        );
      } else {
        setErrorMessage(`Error: Formato inválido para LW: ${offsetBase}`);
        console.error(`Error: Formato inválido para LW: ${offsetBase}`);
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

        if (address < 0 || address >= Object.keys(memory).length) {
          setErrorMessage(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          console.error(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          break;
        }

        memory[address] = registers[rt] || 0;
        console.log(
          `SW: Guardando valor ${registers[rt]} en dirección ${address} desde registro ${rt}`
        );
      } else {
        setErrorMessage(`Error: Formato inválido para SW: ${offsetBase}`);
        console.error(`Error: Formato inválido para SW: ${offsetBase}`);
      }
      break;
    }

    // Operaciones de acceso a memoria - byte
    case "lb": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;

        if (address < 0 || address >= Object.keys(memory).length) {
          setErrorMessage(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          console.error(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          break;
        }

        // Cargar byte y extender el signo
        let byte = memory[address] & 0xff;
        if (byte & 0x80) {
          // Si el bit más significativo está activo, extender signo
          byte = byte | 0xffffff00;
        }

        registers[rt] = byte;
        console.log(
          `LB: Cargando byte ${byte} desde dirección ${address} a registro ${rt}`
        );
      } else {
        setErrorMessage(`Error: Formato inválido para LB: ${offsetBase}`);
        console.error(`Error: Formato inválido para LB: ${offsetBase}`);
      }
      break;
    }
    case "lbu": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;

        if (address < 0 || address >= Object.keys(memory).length) {
          setErrorMessage(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          console.error(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          break;
        }

        // Cargar byte sin extender el signo
        const byte = memory[address] & 0xff;

        registers[rt] = byte;
        console.log(
          `LBU: Cargando byte sin signo ${byte} desde dirección ${address} a registro ${rt}`
        );
      } else {
        setErrorMessage(`Error: Formato inválido para LBU: ${offsetBase}`);
        console.error(`Error: Formato inválido para LBU: ${offsetBase}`);
      }
      break;
    }
    case "sb": {
      const [rt, offsetBase] = operands;
      const match = offsetBase.match(/(-?\d+)\((\w+)\)/);
      if (match) {
        const offset = parseInt(match[1]);
        const base = match[2];
        const address = (registers[base] || 0) + offset;

        if (address < 0 || address >= Object.keys(memory).length) {
          setErrorMessage(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          console.error(
            `Error: Acceso a dirección de memoria inválida: ${address}`
          );
          break;
        }

        // Guardar solo el byte menos significativo
        const byte = registers[rt] & 0xff;
        memory[address] = byte;

        console.log(
          `SB: Guardando byte ${byte} en dirección ${address} desde registro ${rt}`
        );
      } else {
        setErrorMessage(`Error: Formato inválido para SB: ${offsetBase}`);
        console.error(`Error: Formato inválido para SB: ${offsetBase}`);
      }
      break;
    }

    // Instrucciones de salto condicional
    case "beq": {
      const [rs, rt, offset] = operands;
      if (registers[rs] === registers[rt]) {
        // El salto debe ser PC + 1 (siguiente instrucción) + offset - 1 (ajuste)
        const newPC = PC + 1 + parseImmediate(offset);
        console.log(`BEQ: Salto a PC ${newPC} (${rs} === ${rt})`);
        return newPC;
      }
      console.log(`BEQ: No se realizó salto (${rs} !== ${rt})`);
      break;
    }
    case "bne": {
      const [rs, rt, offset] = operands;
      if (registers[rs] !== registers[rt]) {
        const newPC = PC + 1 + parseImmediate(offset);
        console.log(`BNE: Salto a PC ${newPC} (${rs} !== ${rt})`);
        return newPC;
      }
      console.log(`BNE: No se realizó salto (${rs} === ${rt})`);
      break;
    }

    // Instrucciones nuevas de salto
    case "bgtz": {
      const [rs, offset] = operands;
      if (registers[rs] > 0) {
        const newPC = PC + 1 + parseImmediate(offset);
        console.log(`BGTZ: Salto a PC ${newPC} (${rs} > 0)`);
        return newPC;
      }
      console.log(`BGTZ: No se realizó salto (${rs} <= 0)`);
      break;
    }

    case "bgez": {
      const [rs, offset] = operands;
      if (registers[rs] >= 0) {
        const newPC = PC + 1 + parseImmediate(offset);
        console.log(`BGEZ: Salto a PC ${newPC} (${rs} >= 0)`);
        return newPC;
      }
      console.log(`BGEZ: No se realizó salto (${rs} < 0)`);
      break;
    }

    case "bltz": {
      const [rs, offset] = operands;
      if (registers[rs] < 0) {
        const newPC = PC + 1 + parseImmediate(offset);
        console.log(`BLTZ: Salto a PC ${newPC} (${rs} < 0)`);
        return newPC;
      }
      console.log(`BLTZ: No se realizó salto (${rs} >= 0)`);
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
    case "slt": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
      console.log(
        `SLT: ${rs}(${registers[rs]}) < ${rt}(${registers[rt]}) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "sltu": {
      const [rd, rs, rt] = operands;
      registers[rd] = unsigned(registers[rs]) < unsigned(registers[rt]) ? 1 : 0;
      console.log(
        `SLTU: ${rs}(${registers[rs]}) < ${rt}(${registers[rt]}) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "and": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] & registers[rt];
      console.log(
        `AND: ${rs}(${registers[rs]}) & ${rt}(${registers[rt]}) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "or": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] | registers[rt];
      console.log(
        `OR: ${rs}(${registers[rs]}) | ${rt}(${registers[rt]}) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "nor": {
      const [rd, rs, rt] = operands;
      registers[rd] = ~(registers[rs] | registers[rt]);
      console.log(
        `NOR: ~(${rs}(${registers[rs]}) | ${rt}(${registers[rt]})) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "xor": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] ^ registers[rt];
      console.log(
        `XOR: ${rs}(${registers[rs]}) ^ ${rt}(${registers[rt]}) = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "sll": {
      const [rd, rt, shamt] = operands;
      registers[rd] = registers[rt] << parseInt(shamt);
      console.log(
        `SLL: ${rt}(${registers[rt]}) << ${shamt} = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "srl": {
      const [rd, rt, shamt] = operands;
      registers[rd] = registers[rt] >>> parseInt(shamt);
      console.log(
        `SRL: ${rt}(${registers[rt]}) >>> ${shamt} = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "sra": {
      const [rd, rt, shamt] = operands;
      registers[rd] = registers[rt] >> parseInt(shamt);
      console.log(
        `SRA: ${rt}(${registers[rt]}) >> ${shamt} = ${registers[rd]}, guardado en ${rd}`
      );
      break;
    }
    case "jr": {
      const [rs] = operands;
      console.log(`JR: Saltando a dirección ${registers[rs]}`);
      return registers[rs];
    }
    case "slti": {
      const [rt, rs, immediate] = operands;
      registers[rt] = registers[rs] < parseImmediate(immediate) ? 1 : 0;
      console.log(
        `SLTI: ${rs}(${registers[rs]}) < ${immediate} = ${registers[rt]}, guardado en ${rt}`
      );
      break;
    }
    case "sltiu": {
      const [rt, rs, immediate] = operands;
      registers[rt] =
        unsigned(registers[rs]) < unsigned(parseImmediate(immediate)) ? 1 : 0;
      console.log(
        `SLTIU: ${rs}(${registers[rs]}) < ${immediate} = ${registers[rt]}, guardado en ${rt}`
      );
      break;
    }
    case "andi": {
      const [rt, rs, immediate] = operands;
      registers[rt] = registers[rs] & parseImmediate(immediate);
      console.log(
        `ANDI: ${rs}(${registers[rs]}) & ${immediate} = ${registers[rt]}, guardado en ${rt}`
      );
      break;
    }
    case "ori": {
      const [rt, rs, immediate] = operands;
      registers[rt] = registers[rs] | parseImmediate(immediate);
      console.log(
        `ORI: ${rs}(${registers[rs]}) | ${immediate} = ${registers[rt]}, guardado en ${rt}`
      );
      break;
    }
    case "xori": {
      const [rt, rs, immediate] = operands;
      registers[rt] = registers[rs] ^ parseImmediate(immediate);
      console.log(
        `XORI: ${rs}(${registers[rs]}) ^ ${immediate} = ${registers[rt]}, guardado en ${rt}`
      );
      break;
    }
    case "lui": {
      const [rt, immediate] = operands;
      registers[rt] = parseImmediate(immediate) << 16;
      console.log(`LUI: Cargando ${immediate} << 16 en ${rt}`);
      break;
    }

    default: {
      setErrorMessage(``);
      console.error(``);
      break;
    }
  }
}

// Funciones auxiliares
function parseImmediate(value) {
  if (typeof value === "string" && value.startsWith("0x")) {
    return parseInt(value.substring(2), 16);
  }
  return parseInt(value, 10);
}

function unsigned(val) {
  return val >>> 0;
}

export default MIPS;
