import React from 'react';
import BNBLogo from '../../images/swap/btc.svg'
import ReceiveLogo from '../../images/swap/receive.svg'
import SwitchIcon from '../../images/swap/switch.svg'
import { SwapFunction, ApproveFunction } from './functions'
import { ethers } from "ethers";
import axios from "axios"
import "./swap.scss"
import values from "../../values.json";
import {provider, setProvider, signer, setSigner} from '../../App';
import tokenAbi from '../../abi/token.json';


const Swap = ({ useraddress, provider }) => {
  let _signer = React.useContext(signer);
  const [amount, setAmount] = React.useState("");
  const [receivingamount, setreceivingamount] = React.useState(0);
  const [swaptokentwo, SwapTokentwo] = React.useState("none");
  const [swaptokenone, SwapTokenone] = React.useState("");
  const [balancetoken, setBalanceToken] = React.useState(0);
  const [userbalance, setUserBalance] = React.useState(0);
  const [walletconnect, setWalletconnect] = React.useState(false);
  const [error, setError] = React.useState(false);

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
      setWalletconnect(true)
      const balance = await provider.getBalance(useraddress);
      const balanceformat = ethers.utils.formatEther(balance);
      setUserBalance(balanceformat);

      try{
        let puretoken = new ethers.Contract(
          values.token,
          tokenAbi,
          _signer
        );
        let _wallet = await _signer.getAddress();  
        console.log(_wallet)
      const tokenbalance = await puretoken.balanceOf(_wallet);
      const tokenbalanceformat = ethers.utils.formatEther(tokenbalance);
      setBalanceToken(tokenbalanceformat)
      }
      catch(err){
        console.log(err)
      }


      await SwapFunction(useraddress)
    }
  }

  const Connectwallet = async () => {
    document.getElementById("walletconnect").click();
  }


  const Tokenvalue = async (amount) => {
    if (amount > userbalance) {
      setError("Insufficient BNB balance")
    }
    else {
    let amountconvert = ethers.utils.parseEther(amount);
    let exchangerootendpoint = `https://api.1inch.exchange/v4.0/56/quote?fromTokenAddress=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&toTokenAddress=0xc3BcE47886e56316B2A5A4b2C926561AE94039A2&amount=${amountconvert}`
    try {
      const response = await axios.get(exchangerootendpoint);
      //console.log("Approval=>", response.data)
    } catch (exchangerootendpoint) {
      let error = exchangerootendpoint.response.data.description;
      setError(error)
    }
  }
  }

  return (
    <div className='landing'>
      <div className='stak_box'>
        <div className='stak_heading'>
          <h2>Swapping</h2>
          <p>Convert your BNB to PURE or vice versa, Easiest and fastest way to
            convert your assets</p>
        </div>
        <div className='stak_body' id="section-one" style={{ display: `${swaptokenone}` }}>
          <div className="input1">
            <input placeholder='Enter Amount' value={amount}
              onChange={(e) => { setAmount(e.target.value); Tokenvalue(amount) }} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={BNBLogo} alt="BNB Logo" width="100%" />
            </div>
          </div>
          <div onClick={() => { SwapTokentwo(""); SwapTokenone("none") }} className="switciconlogo">
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
              <button type='submit' onClick={() => ApproveFunction(useraddress, amount)} className='swap-button'>SWAP</button>
            </div>
          ) : ("")}
        </div>

        <div className='stak_body' id="section-two" style={{ display: `${swaptokentwo}` }}>
          <div className="input1">
            <input placeholder='Enter Amount' value={amount}
              onChange={(e) => { setAmount(e.target.value); Tokenvalue(amount) }} className="form-field" type="text" />
            <div className='maxToken'>
              <img src={ReceiveLogo} alt="Recever Logo" width="100%" />
            </div>
          </div>
          <div onClick={() => { SwapTokentwo("none"); SwapTokenone("") }} className="switciconlogo">
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
              <button type='submit' onClick={() => ApproveFunction(useraddress, amount)} className='swap-button'>SWAP</button>
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
          <p>Your PURE Balance <span className='stack_value'>{parseFloat(balancetoken).toFixed(2)} PURE</span></p>
        </div>
      </div>
    </div >

  )
}

export default Swap