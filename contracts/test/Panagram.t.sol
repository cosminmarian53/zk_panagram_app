// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Panagram} from "src/Panagram.sol";
import {HonkVerifier} from "src/Verifier.sol";

contract PanagramTest is Test {
    Panagram public panagram;
    HonkVerifier public verifier;
    uint256 constant FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    bytes32 ANSWER = bytes32(uint256(keccak256("triangles")) % FIELD_MODULUS);
    address user = makeAddr("user");

    function setUp() public {
        verifier = new HonkVerifier();
        panagram = new Panagram(verifier);
        //create answer
        panagram.newRound(ANSWER);
        //start round
    }

    function _getProof(bytes32 guess, bytes32 correctAnswer) internal returns (bytes memory) {
        uint256 NUM_ARGS = 5;
        string[] memory inputs = new string[](NUM_ARGS);
        inputs[0] = "npx";
        inputs[1] = "tsx";
        inputs[2] = "js-scripts/generateProof.ts";
        inputs[3] = vm.toString(guess);
        inputs[4] = vm.toString(correctAnswer);

        bytes memory result = vm.ffi(inputs);
        return result;
    }
    // 1. Test someone receives NFT 0 if they guess correctly first

    function testCorrectGuessPasses() public {
        vm.prank(user);
        panagram.makeGuess(_getProof(ANSWER, ANSWER));
    }
    // 2. Test someone receives NFT 1 if they guess correctly second

    // 3. Test we can start a new round (e.g., after the current round's time has elapsed or conditions are met)
}
