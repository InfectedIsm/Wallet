import React, { useEffect, useState} from 'react';
//we import the 2 functions we created in utils.js
import { getWeb3, getWallet} from './utils.js'

function App() {
  //each array is composed of a variable to store the instance, and a function to set the variable
  //don't try to understand rn, its React shit
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  
  useEffect(() => {
    const init = async () => {
      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const wallet = await getWallet(web3);
      setAccounts(accounts);
      setWallet(wallet);
    };
    init();
  }, []);

  if(
    typeof web3 === 'undefined'
    || typeof accounts === 'undefined'
    || typeof wallet === 'undefined'
  ) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Multisig Dapp Yeah
    </div>
  );
}

export default App;
