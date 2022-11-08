import React from 'react';
import BNBLogo from '../../images/swap/btc.svg'
import ReceiveLogo from '../../images/swap/receive.svg'
import SwitchIcon from '../../images/swap/switch.svg'
import { CheckAllowance, ApproveFunction, SwapTokens } from './functions'
import { ethers } from "ethers";
import axios from "axios"
import "./swap.scss"
import toast, { Toaster } from 'react-hot-toast';

const Swap = ({ useraddress, provider, wallet }) => {

  const [amount, setAmount] = React.useState("");
  const [receivingamount, setreceivingamount] = React.useState(0);
  const [swaptokentwo, SwapTokentwo] = React.useState("none");
  const [swaptokenone, SwapTokenone] = React.useState("");
  const [balancetoken, setBalanceToken] = React.useState(0);
  const [userbalance, setUserBalance] = React.useState(0);
  const [tokenfromaddress, settokenfromaddress] = React.useState("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
  const [tokentoaddress, settokentoaddress] = React.useState("0x1e8150ea46E2A7FBB795459198fBB4B35715196c");
  const [walletconnect, setWalletconnect] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [token, setToken] = React.useState("SHIH");


  setTimeout(function () {
    Wallet()
  }, 2000);

  React.useEffect(() => {
    Wallet()
  }, []);

  const Wallet = async () => {
    if (useraddress === "Connect") {
      setWalletconnect(false)
    } else {
      toast.dismiss();
      setWalletconnect(true); console.log("Wallet->", wallet)
      const balance = await provider.getBalance(useraddress);
      const balanceformat = ethers.utils.formatEther(balance);
      let balanceendpoint = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x1e8150ea46E2A7FBB795459198fBB4B35715196c&address=${useraddress}&tag=latest&apikey=SDVCH48GXWPXJEGA6J3J3UNRUV6JH997ZK`
      try {
        const response = await axios.get(balanceendpoint);
        const balanceformat = ethers.utils.formatEther(response.data.result);
        setBalanceToken(Math.round(balanceformat))
      } catch (err) {
        console.log("Error=>", err.message)
      }
      setWalletconnect(true);
      setUserBalance(balanceformat)
      await CheckAllowance(useraddress, tokentoaddress)
    }
  }


  const Connectwallet = async () => {
    toast.loading("Connecting Wallet...")
    document.getElementById("walletconnect").click();
  }


  const Tokenvalue = async (props) => {
    if (walletconnect === true) {
      if (tokenfromaddress === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
    if (props > userbalance) {
      const qs = require('qs');
      document.querySelector('#swapBtn').disabled = true;
      setError("Insufficient BNB balance")
       try {
        const params = {
          "sellToken": tokenfromaddress,
          "buyToken": tokentoaddress,
          "sellAmount": (ethers.utils.parseEther(props)).toString(),
        }
        const response = await fetch(`https://bsc.api.0x.org/swap/v1/price?${qs.stringify(params)}`);
        const data = await response.json();
        const price = ethers.utils.formatEther(data.buyAmount);
        const result = Math.round(price * 100000) / 100000;
        setreceivingamount(result)
      } catch (error) {
        setError("Insufficient BNB balance")
      }
    }
    else {
      const qs = require('qs');
      document.querySelector('#swapBtn').disabled = false;
      try {
        const params = {
          "sellToken": tokenfromaddress,
          "buyToken": tokentoaddress,
          "sellAmount": (ethers.utils.parseEther(props)).toString(),
        }
        const response = await fetch(`https://bsc.api.0x.org/swap/v1/price?${qs.stringify(params)}`);
        const data = await response.json();
        const price = ethers.utils.formatEther(data.buyAmount);
        const result = Math.round(price);
        setreceivingamount(result)
      } catch (error) {
        //
      }
    }
  }
  else {
    if (props > balancetoken) {
      const qs = require('qs');
      document.querySelector('#swapBtn').disabled = true;
      setError("Insufficient PURE balance")
       try {
        const params = {
          "sellToken": tokenfromaddress,
          "buyToken": tokentoaddress,
          "sellAmount": (ethers.utils.parseEther(props)).toString(),
        }
        const response = await fetch(`https://bsc.api.0x.org/swap/v1/price?${qs.stringify(params)}`);
        const data = await response.json();
        const price = ethers.utils.formatEther(data.buyAmount);
        const result = Math.round(price * 100000) / 100000;
        setreceivingamount(result)
        document.querySelector('#swapBtn1').disabled = true;
      } catch (error) {
        setError("Insufficient PURE balance")
      }
    }
    else {
      const qs = require('qs');
      document.querySelector('#swapBtn').disabled = false;
      try {
        const params = {
          "sellToken": tokenfromaddress,
          "buyToken": tokentoaddress,
          "sellAmount": (ethers.utils.parseEther(props)).toString(),
        }
        const response = await fetch(`https://bsc.api.0x.org/swap/v1/price?${qs.stringify(params)}`);
        const data = await response.json();
        const price = ethers.utils.formatEther(data.buyAmount);
        const result = Math.round(price);
        setreceivingamount(result)
      } catch (error) {
        //
      }
    }
  }
  setTimeout(function () {
  setError(false)
  }, 3000);
  }
  else {
    toast.error("Please connect wallet")
  }
  }

  return (
    <div className='landing'>
      <Toaster
      position="top-center"
      reverseOrder={false}
      />
      <div className='stak_box'>
        <div className='stak_heading'>
          <h2>Swapping</h2>
          <p>Convert your BNB to PURE or vice versa, Easiest and fastest way to
            convert your assets</p>
        </div>
        <div className='stak_body' id="section-one" style={{ display: `${swaptokenone}` }}>
          <div className="input1">
            <input placeholder='Enter Amount'
              onChange={(e) => { setAmount(e.target.value); Tokenvalue(e.target.value) }} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={BNBLogo} alt="BNB Logo" width="100%" />
            </div>
          </div>
          <div onClick={() => { setreceivingamount(""); setAmount(""); setToken("BNB"); SwapTokentwo(""); SwapTokenone("none"); settokenfromaddress("0x1e8150ea46E2A7FBB795459198fBB4B35715196c"); settokentoaddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") }} className="switciconlogo">
            <img src={SwitchIcon} alt="Switch Icon" />
          </div>

          <div className="input1">
            <input placeholder='You Receive' value={receivingamount} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={ReceiveLogo} alt="Recever Logo" width="100%" />
            </div>
          </div>
          {walletconnect === false ? (
            <div className="switciconlogo">
              <button type='submit' onClick={Connectwallet} className='swap-button'>Connect Wallet</button>
            </div>
          ) : walletconnect === true ? (
            <div className="switciconlogo">
              <button id="swapBtn" type='submit' onClick={() => SwapTokens(useraddress, amount, tokenfromaddress, tokentoaddress)} className='swap-button'>SWAP</button>
            </div>
          ) : ("")}
        </div>

        <div className='stak_body' id="section-two" style={{ display: `${swaptokentwo}` }}>
          <div className="input1">
            <input placeholder='Enter Amount'
              onChange={(e) => { setAmount(e.target.value); Tokenvalue(e.target.value) }} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={ReceiveLogo} alt="Recever Logo" width="100%" />
            </div>
          </div>
          <div onClick={() => {  setreceivingamount(""); setToken("SHIH"); setAmount(""); SwapTokentwo("none"); SwapTokenone(""); settokenfromaddress("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"); settokentoaddress("0x1e8150ea46E2A7FBB795459198fBB4B35715196c") }} className="switciconlogo">
            <img src={SwitchIcon} alt="Switch Icon" />
          </div>
          <div className="input1">
            <input placeholder='You Receive' value={receivingamount} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={BNBLogo} alt="BNB Logo" width="100%" />
            </div>
          </div>
          {walletconnect === false ? (
            <div className="switciconlogo">
              <button type='submit' onClick={Connectwallet} className='swap-button'>Connect Wallet</button>
            </div>
          ) : walletconnect === true ? (
            <div className="switciconlogo">
              <button id='swapBtn1' type='submit' onClick={() => SwapTokens(useraddress, amount, tokenfromaddress, tokentoaddress)} className='swap-button'>SWAP</button>
            </div>
          ) : ("")}

        </div>


        {error && (
          <div className='error-message'>
            <center>{error}</center>
          </div>
        )}

        <div className='stak_body_footer'>
          <p>Your BNB Balance <span className='stack_value'>{userbalance} BNB</span></p>
          <p>Your PURE Balance <span className='stack_value'>{balancetoken} PURE</span></p>
        </div>
      </div>
    </div >

  )
}

export default Swap