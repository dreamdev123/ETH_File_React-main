import { Container, Button, Form } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
//import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';


function App() {
  const [ipfsHash, setIpfsHash] = useState('');
  const [buffer, setBuffer] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [gasUsed, setGasUsed] = useState('');
  const [txReceipt, setTxReceipt] = useState('');
  const [walletAddress, setWallet] = useState('');
  const [status, setStatus] = useState('');

  useEffect(async () => {
    const { address, status } = await getCurrentWalletConnected();

    setWallet(address);
    setStatus(status);

    addWalletListener();
    // storehash.defaultChain = process.env.ROPSTEN;

  }, []);
  
  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const obj = {
          status: "Metamask wallet is correctly connected.",
          address: addressArray[0],
        };
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

  const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
            status: "Metamask wallet is correctly connected.",
          };
        } else {
          return {
            address: "",
            status: "Connect to Metamask using the \'Connect\' button.",
          };
        }
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("Metamask wallet is corectly connected.");
        } else {
          setWallet("");
          setStatus("Connect to Metamask using the \'Connect\' button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault();

    console.log("new send button clicked");
    const tempEthAddress = storehash.options.address;
    setEthAddress(tempEthAddress);
    if(!buffer){
      alert("Please select file!");
      return;
    }
    ipfs.add(buffer, (err, tempIpfsHash) => {
      console.log("ok, IPFS Request sucess and result below");
      console.log(err, tempIpfsHash);
      if(!tempIpfsHash){
        alert("Connection Timeout Error!!! \nPlease check your net status!");
        return;
      }
      setIpfsHash(tempIpfsHash[0].hash);
      setGasUsed('20000000000');
      storehash.methods.sendHash(ipfsHash).send({
        from: walletAddress,
        gasPrice:gasUsed
      }, (err, tempTransactionHash) => {
        console.log(tempTransactionHash);
        setTransactionHash(tempTransactionHash);
      });
    });
  };
  const captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => convertToBuffer(reader);
  }

  const convertToBuffer = async (reader) => {
    const buffer = await Buffer.from(reader.result);
    setBuffer(buffer);
  }

  const onClick = async () => {
    try {
      setBlockNumber('waiting...');
      // setGasUsed('waiting...');

      await web3.eth.getTransactionReceipt(transactionHash, (err, tempTxReceipt) => {
        console.log(err, tempTxReceipt);
        setTxReceipt(tempTxReceipt);
      });
      await setBlockNumber(txReceipt.blockNumber);
      // await setGasUsed(txReceipt.gasUsed);
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Ethereum and IPFS Resume Upload</h1>
        <Button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </Button>
      </header>

      <hr />
      <Container>
        <h3> Choose file to send to IPFS</h3>
        <Form onSubmit={onSubmit}>
          <input type='file' onChange={captureFile} />
          <Button id="whiteButton" type='submit'>Send it</Button>
        </Form>

        <hr />
        <Button id="whiteButton" onClick={onClick}>Get Transction Receipt</Button>
      </Container>
      <Container className='tablecls'>
        <table>
          <thead>
            <tr>
              <th width='50%'>Tx Receipt Category</th>
              <th width='50%'>Values</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>IPFS Hash Stored on Eth Contract</td>
              <td>{ipfsHash}</td>
            </tr>
            <tr>
              <td>Ethereum Contract Address</td>
              <td>{ethAddress}</td>
            </tr>

            <tr>
              <td>TxReceipt Hash</td>
              <td>{transactionHash}</td>
            </tr>

            <tr>
              <td>Block Number</td>
              <td>{blockNumber}</td>
            </tr>

            <tr>
              <td>Gas Used Amount</td>
              <td>{gasUsed}</td>
            </tr>
          </tbody>
        </table>
      </Container>
      <hr />
      <div id="status">
      <h4>
        Wallet Status:
      </h4>
      <p>
        {status}
      </p>
      </div>
      
    </div>
  );
}

export default App;
