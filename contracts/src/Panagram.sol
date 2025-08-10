//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IVerifier} from "./Verifier.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Panagram is ERC1155, Ownable {
    IVerifier public verifier;
    bytes32 private s_answer;
    IVerifier public s_verifier; // Address of the verifier contract
    mapping(address => uint256) public s_lastCorrectGuessRound;
    uint256 public constant PANAGRAM_TOKEN_ID = 1;
    uint256 public constant MIN_DURATION = 10800;
    uint256 public s_currentRound;
    address public s_currentRoundWinner;
    uint256 public s_roundStartTime;
    string public constant NFT_TOKEN_URI =
        "ipfs://bafybeicqfc4ipkle34tgqv3gh7gccwhmr22qdg7p6k6oxon255mnwb6csi/{id}.json";

    //Events
    event Panagram__VerifierUpdated(address indexed newVerifier);
    event Panagram__NewRoundCreated(bytes32 indexed answer);
    event Panagram_WinnerCrowned(address indexed winner, uint256 round);
    event Panagram_RunnerUpCrowned(address indexed runnerUp, uint256 round);

    //Errors
    error Panagram_MinTimeNotPassed(uint256 minDuration, uint256 timePassed);
    error Panagram_NoRoundWinner();
    error Panagram_FirstPanagramNotSet();
    error Panagram_AlreadyGuessedCorrectly(uint256 round, address user);
    error Panagram_InvalidProof();

    constructor(IVerifier _verifier) ERC1155(NFT_TOKEN_URI) Ownable(msg.sender) {
        verifier = _verifier;
    }

    //function to create a new round
    function newRound(bytes32 _answer) external onlyOwner {
        if (s_roundStartTime == 0) {
            // First round
            s_roundStartTime = block.timestamp;
            s_answer = _answer;
        } else {
            // Subsequent rounds
            if (block.timestamp < s_roundStartTime + MIN_DURATION) {
                revert Panagram_MinTimeNotPassed(MIN_DURATION, block.timestamp - s_roundStartTime);
            }
            if (s_currentRoundWinner == address(0)) {
                // Previous round must have a winner to start a new one.
                revert Panagram_NoRoundWinner();
            }
            // Reset for the new round
            s_roundStartTime = block.timestamp;
            s_currentRoundWinner = address(0);
            s_answer = _answer;
        }
        s_currentRound++;
        emit Panagram__NewRoundCreated(_answer);
    }
    //function to allow users to submit a guess

    function makeGuess(bytes memory _proof) external returns (bool) {
        if (s_currentRound == 0) {
            revert Panagram_FirstPanagramNotSet();
        }
        if (s_lastCorrectGuessRound[msg.sender] == s_currentRound) {
            revert Panagram_AlreadyGuessedCorrectly(s_currentRound, msg.sender);
        }
        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = s_answer;
        bool proofResult = s_verifier.verify(_proof, publicInputs);
        if (!proofResult) {
            revert Panagram_InvalidProof();
        }

        // If proof is valid, the guess is correct
        s_lastCorrectGuessRound[msg.sender] = s_currentRound;

        if (s_currentRoundWinner == address(0)) {
            // First correct guess for this round
            s_currentRoundWinner = msg.sender;
            _mint(msg.sender, 0, 1, ""); // Mint NFT ID 0 (Winner NFT)
            emit Panagram_WinnerCrowned(msg.sender, s_currentRound);
        } else {
            // Subsequent correct guess (runner-up)
            _mint(msg.sender, 1, 1, ""); // Mint NFT ID 1 (Participant NFT)
            emit Panagram_RunnerUpCrowned(msg.sender, s_currentRound);
        }
        return true;
    }
    // set a new verifier

    function setVerifier(IVerifier _verifier) external onlyOwner {
        require(address(_verifier) != address(0), "Invalid verifier address");
        verifier = _verifier;
        emit Panagram__VerifierUpdated(address(verifier));
    }
}
