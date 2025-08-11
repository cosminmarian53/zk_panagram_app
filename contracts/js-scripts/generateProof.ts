import { Noir } from "@noir-lang/noir_js";
import { ethers } from "ethers";
import { UltraHonkBackend } from "@aztec/bb.js";

//get the circuit file with bytecode
//init noir with circuit
//init the backend with the circuit bytecode
//create the inputs
// execute the circuit with the inputs to create the witness
//generate the proof (using the backend) with the witness
//return the proof
