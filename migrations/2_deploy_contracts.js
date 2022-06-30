const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const Wallet = artifacts.require("Wallet");

//we add the async keyword because we want to use await inside the function
module.exports = async function (deployer, _network, accounts) {
    //in the back, Truffle uses a development blockchain  called Ganache
    //by default, Ganache generate 10 addresses prefunded with ETH
    await deployer.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2);
    const wallet = await Wallet.deployed();
    wallet.sendTransaction({from: accounts[1], value: web3.utils.toWei("1", 'ether')});
};
