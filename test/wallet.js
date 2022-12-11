// const { ethers } = require("ethers");

// Hardhat tests are normally written with Mocha and Chai.
// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Wallet Contract", function () {

  //the deployTokenFixture function is executed once to get a context (wallet, signers, ...)
  //then this context can be reused during test to save test time 
  async function deployTokenFixture() {

    const walletFactory = await ethers.getContractFactory("Wallet");
    const [signer0, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    // const signers = await ethers.getSigners(); // works too with signers[n] 

    const wallet = await walletFactory.deploy([signer0.address, signer1.address, signer2.address], 2);

    await wallet.deployed();

    //sending 10 ETH to contract
    await signer0.sendTransaction({
            from: signer0.address,
            to: wallet.address,
            value: ethers.utils.parseEther("10.0")
          });

    console.log("contract starting balance : %f ETH", ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address)));

    // Fixtures can return anything you consider useful for your tests
    return { walletFactory, wallet,
       signer0, signer1, signer2, signer3, signer4
       };
  }

   //////////////////
  //Start of tests//
  describe("Transfer verification", function () {

    it("should have correct approvers and quorum", async () => {

      const { wallet, signer0, signer1, signer2 } = await loadFixture(deployTokenFixture);

      const approvers = await wallet.getApprovers();

      const quorum = await wallet.quorum();

      expect(approvers.length,"number of approvers incorrect")
      .to.equal(3)

      expect(approvers[0], "(at least) one of the approvers is not correct")
      .to.equal(signer0.address);

      expect(approvers[1], "(at least) one of the approvers is not correct")
      .to.equal(signer1.address);

      expect(approvers[2], "(at least) one of the approvers is not correct")
      .to.equal(signer2.address);

      expect(quorum, "quorum value not correct")
      .to.equal(2);
    });


    it("should create transfers", async () => {
      const { wallet, signer0, signer3 } = await loadFixture(deployTokenFixture);

      await wallet.createTransfer(100, signer3.address, {from: signer0.address});
      const transfers = await wallet.getTransfers();

      expect(transfers.length, "number of transfer incorrect")
      .to.equal(1);

      expect(transfers[0].id, "wrong transfer id")
      .to.equal(0);

      expect(transfers[0].amount, "wrong amount")
      .to.equal(100);

      expect(transfers[0].to, "wrong recipient")
      .to.equal(signer3.address);

      expect(transfers[0].approvals, "wrong num of approvals")
      .to.equal(0);

      expect(transfers[0].sent, "wrong sent status")
      .to.be.false;
    });
    

    it("should NOT create transfers if sender is not approved", async() => {
      const { wallet, signer3, signer4 } = await loadFixture(deployTokenFixture);
      await expect(
        wallet.connect(signer3).createTransfer(100, signer4.address))
        .to.be.revertedWith("only approver allowed");
    });


    it("should increment approval", async () => {
      const { wallet, signer0, signer1} = await loadFixture(deployTokenFixture);
      
      await wallet.connect(signer0).createTransfer(100, signer1.address, {from: signer0.address});
      let transfers = await wallet.getTransfers();

      expect(
        transfers[0].approvals, "expecting 0 approvals before approved")
        .to.equal(0);
      
      await wallet.connect(signer1).approveTransfer(transfers[0].id, {from: signer1.address});
      transfers = await wallet.getTransfers();
      expect(
        transfers[0].approvals, "expecting 1 approval after approved")
        .to.equal(1);

      expect(
        transfers[0].sent, "sent flag should be false")
        .to.equal(false);

      const walletBalance = ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address));
      expect(
        walletBalance, "wallet balance is wrong")
        .to.equal("10.0");
    });


    it("should send transfer if quorum reached", async () => {
      const {wallet, signer0, signer1, signer2} = await loadFixture(deployTokenFixture);

      await wallet.createTransfer(ethers.utils.parseEther("1"), signer2.address, {from: signer0.address});
      let transfers = await wallet.getTransfers();
      await wallet.connect(signer0).approveTransfer(transfers[0].id, {from: signer0.address});
      await wallet.connect(signer1).approveTransfer(transfers[0].id, {from: signer1.address});
      transfers = await wallet.getTransfers();

      expect(
        transfers[0].approvals, "expecting 2 approvals")
        .to.equal(2);

      expect(
        transfers[0].sent, "expecting sent flag true")
        .to.equal(true);

      const walletBalance = ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address));
      expect(
        walletBalance, "wallet balance is wrong").to.equal("9.0");
    });


    it("should NOT approve transfer if sender is not approved", async () => { 
      const {wallet, signer0, signer3} = await loadFixture(deployTokenFixture);
      await wallet.createTransfer(ethers.utils.parseEther("1.0"), signer0.address, {from: signer0.address});
      let transfers = await wallet.getTransfers();

      await expect (
         wallet.connect(signer0).approveTransfer(transfers[0].id, {from: signer0.address})
        ).not.to.be.reverted;

      await expect (
          wallet.connect(signer3).approveTransfer(transfers[0].id, {from: signer3.address})
        ).to.be.revertedWith("only approver allowed");
    });


    it("should NOT approve transfer if already sent", async () => {
      const {wallet, signer0, signer1, signer2} = await loadFixture(deployTokenFixture);
      await wallet.connect(signer0).createTransfer(ethers.utils.parseEther("1.0"), signer2.address, {from: signer0.address});
      let transfers = await wallet.getTransfers();
      await wallet.connect(signer0).approveTransfer(transfers[0].id, {from: signer0.address});
      await wallet.connect(signer1).approveTransfer(transfers[0].id, {from: signer1.address});
      transfers = await wallet.getTransfers();
      const walletBalance = ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address));

      expect(walletBalance, "wallet balance is wrong")
      .to.equal("9.0");

      await expect(
        wallet.connect(signer2).approveTransfer(transfers[0].id, {from: signer2.address}))
        .to.be.revertedWith("transfer has already been sent");
    });

    it("should NOT approve transfer twice by same user", async () => {
      const {wallet, signer0, signer1, signer2} = await loadFixture(deployTokenFixture);
      await wallet.connect(signer0).createTransfer(ethers.utils.parseEther("1.0"), signer2.address, {from: signer0.address});
      let transfers = await wallet.getTransfers();
      await wallet.connect(signer0).approveTransfer(transfers[0].id, {from: signer0.address});
      await expect(
        wallet.connect(signer0).approveTransfer(transfers[0].id, {from: signer0.address}))
        .to.be.revertedWith("cannot approve transfer twice");
    }); 
  });

   ////////////////
  //End of tests//

});
