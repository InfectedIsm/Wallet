// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Wallet {
    address[] public approvers;
    //setting this constant public automatically create a getter function
    uint public quorum;  
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }
    Transfer[] public transfers;
    //store for each transfer (uint) if the approvers (address) already approved it (bool)
    mapping(address => mapping(uint => bool)) public approvals; 

    constructor(address[] memory _approvers, uint _quorum) {
        approvers = _approvers; //list of valid approvers
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

    //solidity built in function to receive ether if msg.data is empty
    receive() external payable {}

    modifier onlyApprover() {
    bool allowed = false;
    for (uint i=0; i<approvers.length; i++) {
        if (approvers[i] == msg.sender) {
            allowed = true;
        }
    }
    require(allowed == true, "only approver allowed");
    _;
    }

}