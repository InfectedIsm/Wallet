const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");

const { expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const Wallet = artifacts.require('Wallet');

contract ('Wallet', (accounts) => {
    let wallet; //this variable will point to our deployed smart contract

    //this callback will be called >before each< of our tests
    beforeEach(async () => {  
        //calling the new method create the smart contract, thus call the constructor with our parameters
        wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2);
        await web3.eth.sendTransaction({from : accounts[0], to: wallet.address, value: 1000});
    });

    //these are our tests

    // it('should have correct approvers and quorum', async () => {
    //     const approvers = await wallet.getApprovers();
    //     const quorum = await wallet.quorum();
    //     assert(approvers.length === 3, "number of approvers incorrect");
    //     assert(approvers[0] == accounts[0], "(at least) one of the approvers is not correct");
    //     assert(approvers[1] == accounts[1], "(at least) one of the approvers is not correct");
    //     assert(approvers[2] == accounts[2], "(at least) one of the approvers is not correct");
    //     //toNumber js method must be used because JS don't understand Solidity numbers
    //     assert(quorum.toNumber() === 2, "quorum value not correct");
    // });

    // it('should create transfers', async () => {
    //     await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
    //     const transfers = await wallet.getTransfers();
    //     //here numbers are compared with strings because they are in a struct in solidity
    //     //stupid but that's how it is
    //     assert(transfers.length === 1, "number of transfer incorrect");
    //     assert(transfers[0].id === '0', "wrong transfer id");
    //     assert(transfers[0].amount === '100', "wrong amount");
    //     assert(transfers[0].to === accounts[5], "wrong recipient");
    //     assert(transfers[0].approvals === '0', "wrong num of approvals");
    //     assert(transfers[0].sent === false, "wrong sent status");
    // });

    //here we're using the test-helpers library helper function : expectRevert
    //we're telling truffle that the test passes if the call is reverted with the error we specify
    //as the second parameter
    
    // it('should NOT create transfers if sender is not approved', async() => {
    //     await expectRevert(
    //          wallet.createTransfer(100, accounts[5], {from: accounts[4]}),
    //         'only approver allowed'
    //         );
    // });

    // it('should increment approval', async () => {
    //     await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
    //     await wallet.approveTransfer(0);
    //     const transfers = await wallet.getTransfers();
    //     const balance = await web3.eth.getBalance(wallet.address);
    //     assert(transfers[0].approvals === '1', "wrong approval value");
    //     assert(transfers[0].sent === false, "sent should be false");
    //     assert(balance === '1000');
    // });

    // it('should send transfer if quorum reached', async () => {
    //     const balanceBefore = await web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
    //     await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
    //     // 2 approvals to meet the quorum
    //     await wallet.approveTransfer(0,{from : accounts[0]});
    //     await wallet.approveTransfer(0,{from : accounts[1]});
    //     const balanceAfter = await web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
    //     assert(balanceAfter.sub(balanceBefore).toNumber() === 100, "wrong recipient balance");
        
    //     const transfers = await wallet.getTransfers();
    //     const walletBalance = await web3.eth.getBalance(wallet.address);
    //     assert(transfers[0].approvals === '2', "wrong approval value");
    //     assert(transfers[0].sent === true, "sent should be false");
    //     assert(walletBalance === '900',"wallet got wrong balance");
    // });

    // it('should NOT approve transfer if sender is not approved', async () => {
    //     await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
    //     await expectRevert(
    //         wallet.approveTransfer(0, {from: accounts[4]}),
    //         'only approver allowed'
    //     );
    //   });

    it('should NOT approve transfer if transfer is already sent', async () => {
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0,{from: accounts[0]});
        await wallet.approveTransfer(0,{from: accounts[1]});        
        await expectRevert(
            wallet.approveTransfer(0,{from: accounts[2]}),
           'transfer has already been sent'
        );
    });

    it('should NOT approve transfer if transfer is already sent', async () => {
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0,{from: accounts[0]});
        await wallet.approveTransfer(0,{from: accounts[1]});        
        await expectRevert(
            wallet.approveTransfer(0,{from: accounts[2]}),
           'transfer has already been sent'
        );
    });

    it('should NOT approve transfer twice ', async() => {
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0,{from: accounts[0]});
        await expectRevert(
            wallet.approveTransfer(0,{from: accounts[0]}),
           'cannot approve transfer twice'
        );
    });

});