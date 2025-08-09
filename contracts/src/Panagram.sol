//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IVerifier} from "./Verifier.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Panagram is ERC1155, Ownable {
    IVerifier public verifier;
    uint256 public constant PANAGRAM_TOKEN_ID = 1;
    string public constant NFT_TOKEN_URI =
        "ipfs://bafybeicqfc4ipkle34tgqv3gh7gccwhmr22qdg7p6k6oxon255mnwb6csi/{id}.json";

    //Events
    event Panagram__VerifierUpdated(address indexed newVerifier);

    constructor(IVerifier _verifier) ERC1155(NFT_TOKEN_URI) Ownable(msg.sender) {
        verifier = _verifier;
    }

    //function to create a new round

    //function to allow users to submit a guess

    // set a new verifier

    function setVerifier(IVerifier _verifier) external onlyOwner{
        require(address(_verifier) != address(0), "Invalid verifier address");
        verifier = _verifier;
        emit Panagram__VerifierUpdated(address(verifier));
    }
}
