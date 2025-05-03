// Conversión de binario a hexadecimal
export function binaryToHex(binaryString) {
  while (binaryString.length % 4 !== 0) {
    binaryString = "0" + binaryString;
  }

  let hexString = "";
  for (let i = 0; i < binaryString.length; i += 4) {
    const binaryChunk = binaryString.substring(i, i + 4);
    const hexDigit = parseInt(binaryChunk, 2).toString(16);
    hexString += hexDigit;
  }

  return "0x" + hexString.toUpperCase();
}

// Conversión de hexadecimal a binario
export function hexToBinary(hex) {
  let binary = "";
  for (let i = 0; i < hex.length; i++) {
    const bin = parseInt(hex[i], 16).toString(2);
    binary += bin.padStart(4, "0");
  }
  return binary;
}

// Mapa de opcodes
const opcodeMap = {
  add: "000000",
  addu: "000000",
  sub: "000000",
  subu: "000000",
  slt: "000000",
  sltu: "000000",
  and: "000000",
  or: "000000",
  nor: "000000",
  xor: "000000",
  sll: "000000",
  srl: "000000",
  sra: "000000",
  jr: "000000",

  // I-Type
  addi: "001000",
  addiu: "001001",
  slti: "001010",
  sltiu: "001011",
  andi: "001100",
  ori: "001101",
  xori: "001110",
  lui: "001111",
  lw: "100011",
  sw: "101011",
  beq: "000100",
  bne: "000101",

  // J-Type
  j: "000010",
  jal: "000011",
};

// Mapa de funciones (solo para R-Type)
const funcMap = {
  add: "100000",
  addu: "100001",
  sub: "100010",
  subu: "100011",
  slt: "101010",
  sltu: "101011",
  and: "100100",
  or: "100101",
  nor: "100111",
  xor: "100110",
  sll: "000000",
  srl: "000010",
  sra: "000011",
  jr: "001000",
};

// Mapa de registros
const regMap = {
  zero: "00000",
  at: "00001",
  v0: "00010",
  v1: "00011",
  a0: "00100",
  a1: "00101",
  a2: "00110",
  a3: "00111",
  t0: "01000",
  t1: "01001",
  t2: "01010",
  t3: "01011",
  t4: "01100",
  t5: "01101",
  t6: "01110",
  t7: "01111",
  s0: "10000",
  s1: "10001",
  s2: "10010",
  s3: "10011",
  s4: "10100",
  s5: "10101",
  s6: "10110",
  s7: "10111",
  t8: "11000",
  t9: "11001",
  k0: "11010",
  k1: "11011",
  gp: "11100",
  sp: "11101",
  fp: "11110",
  ra: "11111",
};

// Traducción de instrucción MIPS a hexadecimal
export function translateInstructionToHex(instruction) {
  const parts = instruction.trim().split(/\s+|,/);
  const mnemonic = parts[0].toLowerCase();
  const opcode = opcodeMap[mnemonic];

  if (!opcode) return `Unknown Instruction: ${mnemonic}`;
  if (parts.length < 2) return "Invalid Instruction Format";

  let binaryInstruction = "";

  if (opcode === "000000") {
    // R-Type
    const rd = regMap[parts[1]];
    const rs = regMap[parts[2]];
    const rt = regMap[parts[3]];
    const shamt = "00000";
    const funct = funcMap[mnemonic];

    if (["sll", "srl", "sra"].includes(mnemonic)) {
      shamt = parseInt(parts[3]).toString(2).padStart(5, "0");
      binaryInstruction = opcode + "00000" + rt + rd + shamt + funct;
    } else {
      binaryInstruction = opcode + rs + rt + rd + shamt + funct;
    }
  } else if (["001000", "001001"].includes(opcode)) {
    // I-Type immediate (addi, addiu)
    const rt = regMap[parts[1]];
    const rs = regMap[parts[2]];
    let immediate = parseInt(parts[3]);

    if (!rs || !rt || isNaN(immediate)) return "Invalid Immediate Instruction";

    immediate = immediate & 0xffff;
    binaryInstruction =
      opcode + rs + rt + immediate.toString(2).padStart(16, "0");
  } else if (
    ["100011", "100000", "100100", "101011", "101000"].includes(opcode)
  ) {
    // I-Type load/store (lw, lb, lbu, sw, sb)
    const rt = regMap[parts[1]];
    const match = parts[2].match(/(-?\d+)\((\w+)\)/);

    if (!rt || !match || !regMap[match[2]]) return "Invalid Load/Store Syntax";

    const immediate = parseInt(match[1]) & 0xffff;
    const rs = regMap[match[2]];

    binaryInstruction =
      opcode + rs + rt + immediate.toString(2).padStart(16, "0");
  } else if (["000100", "000101"].includes(opcode)) {
    // I-Type branch con dos registros (beq, bne)
    const rs = regMap[parts[1]];
    const rt = regMap[parts[2]];
    let offset = parseInt(parts[3]);

    if (!rs || !rt || isNaN(offset)) return "Invalid Branch Instruction";

    offset = offset & 0xffff;
    binaryInstruction = opcode + rs + rt + offset.toString(2).padStart(16, "0");
  } else if (["000110", "000111"].includes(opcode)) {
    // I-Type branch con un registro (blez, bgtz)
    const rs = regMap[parts[1]];
    const rt = "00000"; // Siempre es 0 para estas instrucciones
    let offset = parseInt(parts[2]);

    if (!rs || isNaN(offset)) return "Invalid Branch Instruction";

    offset = offset & 0xffff;
    binaryInstruction = opcode + rs + rt + offset.toString(2).padStart(16, "0");
  } else if (opcode === "000001") {
    // I-Type branch con códigos especiales (bltz, bgez)
    const rs = regMap[parts[1]];
    let rtCode = "00000"; // BLTZ

    if (mnemonic === "bgez") {
      rtCode = "00001"; // BGEZ
    }

    let offset = parseInt(parts[2]);

    if (!rs || isNaN(offset)) return "Invalid Branch Instruction";

    offset = offset & 0xffff;
    binaryInstruction =
      opcode + rs + rtCode + offset.toString(2).padStart(16, "0");
  } else if (["000010", "000011"].includes(opcode)) {
    // J-Type (j, jal)
    let address = parseInt(parts[1]);

    if (isNaN(address) || address < 0 || address > 0x3ffffff)
      return "Invalid Jump Address";

    binaryInstruction = opcode + address.toString(2).padStart(26, "0");
  } else {
    return `Unsupported Instruction: ${mnemonic}`;
  }

  if (!binaryInstruction) return "Failed to Generate Binary Instruction";

  const hexInstruction = parseInt(binaryInstruction, 2)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
  return hexInstruction;
}

// Traducción de hexadecimal a instrucción MIPS
export function translateInstructionToMIPS(hexInstruction) {
  const binaryInstruction = hexToBinary(hexInstruction);
  const opcode = binaryInstruction.slice(0, 6);

  if (opcode === "000000") {
    // R-Type
    const rs = binaryInstruction.slice(6, 11);
    const rt = binaryInstruction.slice(11, 16);
    const rd = binaryInstruction.slice(16, 21);
    const funct = binaryInstruction.slice(26, 32);

    const mnemonic = Object.keys(funcMap).find((key) => funcMap[key] === funct);

    if (!mnemonic) return "Unknown R-Type Instruction";

    if (["sll", "srl", "sra"].includes(mnemonic)) {
      return `${mnemonic} ${getReg(rd)}, ${getReg(rt)}, ${parseInt(shamt, 2)}`;
    }

    // Normal R-Type
    return `${mnemonic} ${getReg(rd)}, ${getReg(rs)}, ${getReg(rt)}`;
  } else if (["001000", "001001"].includes(opcode)) {
    // I-Type Immediate (addi, addiu)
    const rs = binaryInstruction.slice(6, 11);
    const rt = binaryInstruction.slice(11, 16);
    const immediate = parseInt(binaryInstruction.slice(16, 32), 2);

    const mnemonic = Object.keys(opcodeMap).find(
      (key) => opcodeMap[key] === opcode
    );

    if (!mnemonic) return "Unknown I-Type Instruction";

    // Normal I-Type
    return `${mnemonic} ${getReg(rt)}, ${getReg(rs)}, ${immediate}`;
  } else if (
    ["100011", "100000", "100100", "101011", "101000"].includes(opcode)
  ) {
    // I-Type Load/Store (lw, lb, lbu, sw, sb)
    const rs = binaryInstruction.slice(6, 11);
    const rt = binaryInstruction.slice(11, 16);
    const offset = parseInt(binaryInstruction.slice(16, 32), 2);

    const mnemonic = Object.keys(opcodeMap).find(
      (key) => opcodeMap[key] === opcode
    );

    if (!mnemonic) return "Unknown Load/Store Instruction";

    return `${mnemonic} ${getReg(rt)}, ${offset}(${getReg(rs)})`;
  } else if (["000100", "000101"].includes(opcode)) {
    // I-Type Branch con dos registros (beq, bne)
    const rs = binaryInstruction.slice(6, 11);
    const rt = binaryInstruction.slice(11, 16);
    const offset = parseInt(binaryInstruction.slice(16, 32), 2);

    const mnemonic = Object.keys(opcodeMap).find(
      (key) => opcodeMap[key] === opcode
    );

    if (!mnemonic) return "Unknown Branch Instruction";

    return `${mnemonic} ${getReg(rs)}, ${getReg(rt)}, ${offset}`;
  } else if (["000110", "000111"].includes(opcode)) {
    // I-Type Branch con un registro (blez, bgtz)
    const rs = binaryInstruction.slice(6, 11);
    const offset = parseInt(binaryInstruction.slice(16, 32), 2);

    const mnemonic = Object.keys(opcodeMap).find(
      (key) => opcodeMap[key] === opcode
    );

    if (!mnemonic) return "Unknown Branch Instruction";

    return `${mnemonic} ${getReg(rs)}, ${offset}`;
  } else if (opcode === "000001") {
    // I-Type Branch especial (bltz, bgez)
    const rs = binaryInstruction.slice(6, 11);
    const rtCode = binaryInstruction.slice(11, 16);
    const offset = parseInt(binaryInstruction.slice(16, 32), 2);

    let mnemonic = "bltz"; // Por defecto bltz (rt=00000)

    if (rtCode === "00001") {
      mnemonic = "bgez";
    }

    return `${mnemonic} ${getReg(rs)}, ${offset}`;
  } else if (["000010", "000011"].includes(opcode)) {
    // J-Type
    const address = parseInt(binaryInstruction.slice(6, 32), 2);

    const mnemonic = Object.keys(opcodeMap).find(
      (key) => opcodeMap[key] === opcode
    );

    if (!mnemonic) return "Unknown Jump Instruction";

    return `${mnemonic} ${address}`;
  } else {
    return "Unsupported Instruction";
  }
}

// Función auxiliar para buscar nombre de registro
function getReg(binary) {
  const entry = Object.entries(regMap).find(([, value]) => value === binary);
  return entry ? entry[0] : "UnknownReg";
}
