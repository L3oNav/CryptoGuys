
import './App.css';
import {useEffect, useState} from "react";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const checkIfWalletIsConnected = async() => {
    try{
      const { solana } = window;
      if(solana){
        if(solana.isPhantom){
          console.log("Phanthom wallet found");
          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log("Connected with public key:", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }else{
          alert("Solana object Not found, Get a Phanthom Wallet")
        }
      }
    }catch(error){
      console.log(error)
    }
  };
const connectWallet = async () => {
  const { solana } = window;
  if(solana){
    const response = await solana.connect()
    console.log('Connected with public key',
    response.publicKey.toString()
    );
    setWalletAddress(response.publicKey.toString());
  }
};

const renderNotConnectedContainer = () => (
   <button onClick={connectWallet}>Connect to wallet</button>
)

  useEffect(()=>{
    const onLoad = async() => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return() => window.removeEventListener("load", onLoad);
  },[]);

  return <div className="App">
    {!walletAddress && renderNotConnectedContainer()}</div>
}

export default App;
