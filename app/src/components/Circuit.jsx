import React from "react";
import "../styles/Circuit.css";
import defaultImage from "../images/MIPSCIRCUIT.png";
import addImage from "../images/ADD.png";
import addiImage from "../images/ADDI.png";
import lwImage from "../images/LW.png";
import swImage from "../images/SW.png";
import beqImage from "../images/BEQ.png";
import bneImage from "../images/BNE.png";
import jumpImage from "../images/JUMP.png";
import lbImage from "../images/LW.png";   // Necesitarás crear esta imagen
import sbImage from "../images/SW.png";   // Necesitarás crear esta imagen
import blezImage from "../images/BEQ.png"; // Necesitarás crear esta imagen
import bgezImage from "../images/BEQ.png"; // Necesitarás crear esta imagen
import bgtzImage from "../images/BNE.png"; // Necesitarás crear esta imagen
import bltzImage from "../images/BNE.png"; // Necesitarás crear esta imagen

const instructionImages = {
  // Operaciones aritméticas (usar ADD image)
  add: addImage,
  addu: addImage,
  sub: addImage,
  subu: addImage,

  // Operaciones inmediatas (usar ADDI image)
  addi: addiImage,
  addiu: addiImage,

  // Operaciones de memoria - word
  lw: lwImage,
  sw: swImage,
  
  // Operaciones de memoria - byte (nuevas)
  lb: lbImage || lwImage, // Usa LW como fallback si no existe la imagen
  lbu: lbImage || lwImage,
  sb: sbImage || swImage, // Usa SW como fallback si no existe la imagen

  // Saltos condicionales
  beq: beqImage,
  bne: bneImage,
  
  // Nuevos saltos condicionales
  blez: blezImage || beqImage, // Usa BEQ como fallback si no existe la imagen
  bgez: bgezImage || beqImage,
  bgtz: bgtzImage || beqImage,
  bltz: bltzImage || beqImage,

  // Saltos incondicionales
  j: jumpImage,
  jal: jumpImage,
};

const CircuitImage = ({ currentInstruction, registers }) => {
  const [opName] = currentInstruction.trim().split(" ");
  const imageSrc = instructionImages[opName] || defaultImage;

  return (
    <div className="circuit-container">
      <div className="image-wrapper">
        <img src={imageSrc} alt={`Circuito para ${opName}`} />
        {["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((reg) => (
          <div key={reg} className={`register-value ${reg}`}>
            {`0x${registers[reg].toString(16).toUpperCase()}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitImage;