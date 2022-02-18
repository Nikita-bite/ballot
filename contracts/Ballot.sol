// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Ballot {

    uint[] proposals;
    mapping(address => bool) voters;

    constructor() {
        proposals = new uint[] (5);
    }

    function vote(uint proposal) public payable returns (uint) {
        bool hasVoted = voters[msg.sender];
        require(!hasVoted && proposal < proposals.length);
        voters[msg.sender] = true;
        proposals[proposal]++;
        return proposal;
    }

    function winningProposal() public view returns (uint) {
        uint winningVoteCount = 0;
        uint _winningProposal = 0;
        for (uint prop = 0; prop < proposals.length; prop++) {
            if (proposals[prop] > winningVoteCount) {
                winningVoteCount = proposals[prop];
                _winningProposal = prop;
            }
        }
        return _winningProposal;
    }

    function resultBallot() public view returns (uint[] memory) {
        return proposals;
    }
}
