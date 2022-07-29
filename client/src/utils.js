import Web3 from 'web3';
import Wallet from './contracts/Wallet.json'
//import detectEthereumProvider from '@metamask/detect-provider'

//instantiate a Web3 object
const getWeb3 = () => {
    //in lesson 14 we change the line below
    //return new Web3('http://localhost:9545');
    return new Promise( (resolve, reject) => {
        window.addEventListener('load', async () => {          
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable();
                resolve(web3);
            } catch (error) {
                reject(error);
            }
        } else if(window.web3) {
            const web3 = window.web3;
            console.log("Injected web3 detected.");
            resolve(web3);
        } else {
            reject('Must Install Metamask');
        }
        });
    });
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