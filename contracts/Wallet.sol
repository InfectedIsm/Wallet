// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "../node_modules/hardhat/console.sol";

contract Wallet {
    address[] public approvers;
    mapping (address => bool) isApprover;
    uint public quorum;  
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }
    Transfer[] public transfers;
    mapping(address => mapping(uint => bool)) public approvals; 

    constructor(address[] memory _approvers, uint _quorum) {
        require(_approvers.length >= _quorum);
        approvers = _approvers; //list of valid approvers
        //gas optimization to access only one time length in for loop
        //using a mapping here to make the modifier onlyOwner not iterate over an array
        //over time it will prove its cost efficiency as this modifier is used multiple times
        uint arrayLen = approvers.length; 
        for (uint i=0; i< arrayLen; i++) {
           isApprover[approvers[i]] = true; 
        }
        quorum = _quorum;  //number of validation required to confirm a transfer
    }

    function getApprovers() external view returns (address[] memory){
        return approvers;
    }

    function createTransfer (uint amount, address payable to) external onlyApprover() {

        transfers.push(Transfer(
            transfers.length,
            amount,
            to,
            0,
            false)
        );
    }

    function getTransfers() external view returns (Transfer[] memory){
        return transfers;
    }

    function approveTransfer(uint id) external onlyApprover() {
        require(transfers[id].sent == false, 'transfer has already been sent');
        require(approvals[msg.sender][id] == false, 'cannot approve transfer twice');
        
        approvals[msg.sender][id] = true;
        transfers[id].approvals++;
        
        if(transfers[id].approvals >= quorum) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint amount = transfers[id].amount;
            to.transfer(amount);
        }
    }

    receive() external payable {}

    modifier onlyApprover() {
    require(isApprover[msg.sender] == true, "only approver allowed");
    _;
    }

}