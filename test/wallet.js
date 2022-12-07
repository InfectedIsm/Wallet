// const { ethers } = require("ethers");

// Hardhat tests are normally written with Mocha and Chai.
// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Wallet contract", function () {

  async function deployTokenFixture() {

    const walletFactory = await ethers.getContractFactory("Wallet");
    const [signer0, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    addr0 = signer0.address;
    addr1 = signer1.address;
    addr2 = signer2.address;
    addr3 = signer3.address;
    addr4 = signer4.address;
    console.log("0 :" +addr0);
    console.log("1 :" +addr1);
    console.log("2 :" +addr2);
    console.log("3 :" +addr3);

    const wallet = await walletFactory.deploy([addr0, addr1, addr2], 2);

    await wallet.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { 
      walletFactory, wallet,
      addr0, addr1, addr2, addr3, addr4,
      signer0, signer1, signer2, signer3, signer4
       };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    it('should have correct approvers and quorum', async () => {

      const { wallet, addr0, addr1, addr2 } = await loadFixture(deployTokenFixture);

      const approvers = await wallet.getApprovers();

      const quorum = await wallet.quorum();

      expect(approvers.length,'number of approvers incorrect').to.equal(3) // === 1, "number of approvers incorrect");
      expect(approvers[0], "(at least) one of the approvers is not correct").to.equal(addr0);
      expect(approvers[1], "(at least) one of the approvers is not correct").to.equal(addr1);
      expect(approvers[2], "(at least) one of the approvers is not correct").to.equal(addr2);
      expect(quorum, "quorum value not correct").to.equal(2);
    });

    it('should create transfers', async () => {
      const { wallet, addr0, addr3 } = await loadFixture(deployTokenFixture);

      await wallet.createTransfer(100, addr3, {from: addr0});
      const transfers = await wallet.getTransfers();
      //here numbers are compared with strings because they are in a struct in solidity
      //stupid but that's how it is
      expect(transfers.length, "number of transfer incorrect").to.equal(1);
      expect(transfers[0].id, "wrong transfer id").to.equal(0);
      expect(transfers[0].amount, "wrong amount").to.equal(100);
      expect(transfers[0].to, "wrong recipient").to.equal(addr3);
      expect(transfers[0].approvals, "wrong num of approvals").to.equal(0);
      expect(transfers[0].sent, "wrong sent status").to.be.false;
    });

    // NON WORKING
    /////////////////////////////
    it('should NOT create transfers if sender is not approved', async() => {
      const { wallet, addr4, signer3 } = await loadFixture(deployTokenFixture);
      expect(await wallet.connect(signer3).createTransfer(100, addr4)
        ).to.be.revertedWith('only approver allowed');
    });

  });

  // describe("Transactions", function () {
  // });
});
