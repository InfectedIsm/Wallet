import Web3 from 'web3';
import Wallet from './contracts/Wallet.json'

//instantiate a Web3 object
const getWeb3 = () => {
    return new Web3('http://localhost:9545');
};

//contract instance
//object that is produced by web3 and allow you to interact with a smart contract
//we use the data from the running local blockchain (started with >truffle develop)
const getWallet = async web3 => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Wallet.networks[networkId];
    return new web3.eth.Contract(
       Wallet.abi,
       deployedNetwork && deployedNetwork.address 
    );
};

export {getWeb3, getWallet }