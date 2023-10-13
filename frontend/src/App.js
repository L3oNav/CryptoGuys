
import './App.css';
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
}
const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [campaings, setCampaigns] = useState([]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  }
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phanthom wallet found");
          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log("Connected with public key:", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        } else {
          alert("Solana object Not found, Get a Phanthom Wallet")
        }
      }
    } catch (error) {
      console.log(error)
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect()
      console.log('Connected with public key',
        response.publicKey.toString()
      );
      setWalletAddress(response.publicKey.toString());
    }
  };

  const donate = async (publicKey) => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.methods.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          compaign: publicKey,
          user: provider.wallet.publicKey,
          SystemProgram: SystemProgram.programId
        }
      });
      console.log("Donated some money to: ", publicKey.toString());
    } catch (e) {
      console.error("Error donating: ", error)
    }
  }

  const getCampaigns = async () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Promise.all(await connection.getProgramAccounts(idl, programID, provider).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.publicKey)),
          publickey: campaign.publicKey
        })
      )
    ).then((campaings) => setCampaigns(campaings));
  };

  const createCampaing = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider)
      const [campaing] = PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
        provider.wallet.publicKey.toBuffer
      ],
        program.programId
      );
      console.log("campaing creating...", campaing)
      program.methods.create("campaign name", "campaign description", {
        accounts: {
          campaing,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        }
      });
      console.log(
        "Created a new campaign with address: ",
        campaing.toString()
      )
    } catch (error) {
      console.error('Error creating campaing account', error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to wallet</button>
  )

  
  const renderConnectedContainer = () => (
  <>
    <button onClick={createCampaing}>Create campaign</button>
    <button onClick={getCampaigns}>Get a list of campaings</button>
    <br/>
    {campaings.map((campaign) => (
      <>
        <p>Campaign ID: {campaign.pubkey.toString()}</p>
        <p>
          Balance:{" "}
          {(
            campaign.amountDonated / web3.LAMPORTS_PER_SOL
          ).toString()}
          </p>
          <p>campaign.name</p>
          <p>Campaign.description</p>
          <br/>
          <button onClick={()=> donate(campaign.pubkey)}>
            Donate!
          </button>
        </>
    ))}
    </>
  );


  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">
    {!walletAddress && renderNotConnectedContainer()}
    {walletAddress && renderConnectedContainer()}
  </div>
}

export default App;
