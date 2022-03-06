import React, { useEffect, useState } from "react";
import "./App.scss";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const App = () => {
    const [ currentAccount, setCurrentAccount ] = useState( "" );
    const [tweetValue, setTweetValue] = React.useState("")

    //Create a variable here that holds the contract address after you deploy!
    const contractAddress = "0x0C57bAb76bf9e11C971993f64CF12D67de6CFee5";
    //abi contract
    const contractABI = abi.abi;
    // all waves
    const [ allWaves, setAllWaves ]= useState([]);

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if ( !ethereum ) {
                console.log( "Make sure you have metamask to connect a wallet!" );
                return;
            } else {
                console.log( "We have the ethereum object", ethereum );
            }

            const accounts = await ethereum.request( { method: "eth_accounts" } );

            if ( accounts.length !== 0 ) {
                const account = accounts[0];
                console.log( "Found an authorised account: ", account );
                setCurrentAccount(account);
                getAllWaves();
                } else {
                console.log( "No authorised account found" )
            }
        
        } catch ( error ) {
            console.log( error );
        }
      }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert( "Get MetaMask!" );
        return;
      }

      const accounts = await ethereum.request( { method: "eth_requestAccounts" } );

      console.log( "Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch ( error ) {
      console.log( error )
    }
  }

    const wave = async () => {
        try {
            const { ethereum } = window;

            if ( ethereum ) {
                const provider = new ethers.providers.Web3Provider( ethereum );
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract( contractAddress, contractABI, signer );

                let count = await wavePortalContract.getTotalWaves();
                console.log( "Retrieved total wave count...", count.toNumber() );

                const waveTxn = await wavePortalContract.wave( tweetValue, {gasLimit:300000} );
                console.log( "Mining...", waveTxn.hash );

                await waveTxn.wait();
                console.log( "Mined -- ", waveTxn.hash, "and they say; ", tweetValue );

                count = await wavePortalContract.getTotalWaves();
                console.log( "Retrieved total wave count...", count.toNumber() );
            } else {
                console.log( "Ethereum object doesn't exist!" );
            }
        } catch ( error ) {
            console.log( error );
        }
    }

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            if ( ethereum ) {
                const provider = new ethers.providers.Web3Provider( ethereum );
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract( contractAddress, contractABI, signer );

                // call getAllWaves from smart contract
                const waves = await wavePortalContract.getAllWaves();

                // address, timestamp, message in UI
                let wavesCleaned = [];
                waves.forEach( wave => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date( wave.timestamp * 1000 ),
                        message: wave.message
                    });
                });

            //store waves in react state
            setAllWaves( wavesCleaned );
            } else {
            console.log( "Ethereum object doens't exist?!" );
            }
        } catch ( error ) {
        console.log ( error );
        }
    }
    

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hello there!
        </div>

        <div className="bio">
            I am Matt and I am learning to write smart contracts in solidity
        </div>

        { currentAccount ? (<textarea name="tweetArea"
            placeholder="type your tweet"
            type="text"
            id="tweet"
            value={tweetValue}
            onChange={e => setTweetValue(e.target.value)} />) : null
        }

        <button className="waveButton" onClick={ wave }>
          Wave at Me 👋
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        { !currentAccount && (
          <button className="waveButton" onClick={ connectWallet }>
            Connect Wallet
          </button>
        ) }

            { allWaves.map(( wave, index ) => {
                return (
                    <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                        <div>Address: {wave.address}</div>
                        <div>Time: {wave.timestamp.toString()}</div>
                        <div>Message: {wave.message}</div>
                    </div>
                )
            })}
      </div>
    </div>
  );
}

export default App