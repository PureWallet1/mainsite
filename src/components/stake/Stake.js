import React from 'react';
import './stake.css';
import Progress from 'react-progressbar';
import { ethers, providers } from "ethers";
import values from "../../values.json"
import stakingAbi from '../../abi/staking.json';
import tokenAbi from '../../abi/token.json';
import {provider, setProvider, signer, setSigner} from '../../App';


const Stake = () => {
  let [poolId, setPoolId] = React.useState(4);
  let [APR, setApr] = React.useState(4);
  let [TEMPAPR, setTEMPAPR] = React.useState(1095);
  let [poolInfo, setPoolInfo] = React.useState([]);
  const [error, setError] = React.useState();
  let [userInfo, setUserInfo] = React.useState([]);
  let [whitelistedAddresses, setWalletAddresses] = React.useState([]);
  let [amount, setAmount] = React.useState(0);
  let [balance, setBalance] = React.useState(0);
  let [stakingBalance, setStackingBalance] = React.useState(0);
  let [currentPoolSize, setCurrentPoolSize] = React.useState(0);
  let [maxPoolSize, setMaxPoolSize] = React.useState(0);
  let [timeLock, setTimeLock] = React.useState(0);
  let [myerror, setmyerror] = React.useState();
  let _provider = React.useContext (provider);
  let _setProvider = React.useContext (setProvider);
  let _signer = React.useContext (signer);
  let _setSigner = React.useContext (setSigner);

  const [active, setActive] = React.useState("4");

  const handleClick = (event) => {
    setActive(event.target.id);
  };

  React.useEffect(()=>{
    getPoolInfo();
    getUserInfo();
    getWhiteListAddresses();
  
    
    async function fetch (){
      try{
        let _balance = await _getBalance(values.token);
        console.log("BAlance", _balance);
        setBalance(_balance);
      }catch (err){
        console.log("Error", err);
      }
    }
    fetch();
  }, [_provider, _signer, poolId]);



  async function getPoolInfo (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      var _poolInfo = await staking.poolInfo(poolId);
      console.log ("Pool Info: ", _poolInfo);
      setPoolInfo(_poolInfo);
      let temp = ethers.utils.formatUnits(_poolInfo[3].toString(), decimals).toString()
      console.log ("temp: ", temp, " value: ", _poolInfo[3].toString());
      setCurrentPoolSize(temp);
      temp = ethers.utils.formatUnits(_poolInfo[2].toString(), decimals).toString()
      setMaxPoolSize(temp)
      const reward = parseInt(ethers.utils.formatUnits(_poolInfo[5], decimals));
      let letcurrentPoolSize = parseInt(ethers.utils.formatUnits(_poolInfo[3], decimals))
      const poolDays = _poolInfo[7]
      console.log(`reward` + reward + `reward`  + letcurrentPoolSize + `reward` + poolDays)
      setApr(parseInt((reward * 365 * 100) / (letcurrentPoolSize * poolDays)))





    }catch(err){
      console.log(err);
    }
  }

  async function getUserInfo (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      let _wallet = _signer.getAddress();      
      let _userInfo = await staking.userInfo( poolId, _wallet);
      console.log ("USER Info: ", _userInfo);
      setStackingBalance(ethers.utils.formatUnits(_userInfo[0], decimals).toString())
      setUserInfo(_userInfo);
      let _timestamp = parseInt(_userInfo[1].toString())* 1000;
      let _time = new Date(_timestamp);
      if (_timestamp >0) setTimeLock(_time);
      else setTimeLock(" Not staked yet");
    }catch(err){
      console.log("User error", err);
    }
  }

  async function _getBalance (tokenAddress, accountAddress){
    try {
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let token = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        provider_
      );
      if (!accountAddress){
        accountAddress = await _signer.getAddress();
      }
      let balance = await token.balanceOf (accountAddress);
      console.log ("Balalala", balance)
      let decimals = await token.decimals();
      decimals = parseInt(decimals.toString());
      balance = ethers.utils.formatUnits(balance, decimals);
      return parseFloat(balance.toString()).toFixed(2);
    } catch (err){
      console.log (err, tokenAddress);
      return 0;
    }
  }

  async function getWhiteListAddresses (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      let _wallet = _signer.getAddress();      
      let _wlInfo = await staking.whitelistedAddress( poolId, _wallet);
      console.log ("Whitelist Info: ", _wlInfo);
      setWalletAddresses(_wlInfo);
    }catch(err){
      console.log("User error", err);
    }
  }


  

  async function stakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      const txs = await approve();
      let _amount = ethers.utils.parseUnits(amount.toString(), decimals);
      // console.log (_amount)
      let tx = await staking.stakeTokens(poolId, _amount);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      console.log (error);
      try {
        setError(error.error.data.message)
      } catch {
        setError("Something went wrong, please try again!")
      }
    }
  }

  async function unstakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.unstakeTokens(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      console.log (error);
      try {
        setError(error.error.data.message)
      } catch {
        setError("Something went wrong, please try again!")
      }
    }
  }

  async function claimTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.claimTokens(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      console.log (error);
                try {
                  setError(error.error.data.message)
                } catch {
                  setError("Something went wrong, please try again!")
                }
              }
  }

  async function emergencyWithdraw () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.emergencyWithdraw(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      console.log (error);
      try {
        setError(error.error.data.message)
      } catch {
        setError("Something went wrong, please try again!")
      }
    }
  }



  async function approve() {
    try{
      let tokens = new ethers.Contract(
        values.token,
        tokenAbi,
        _signer
      );
      let _wallet = _signer.getAddress();      
    const isApproved = await tokens.allowance(_wallet, values.stakingAddress);
    const totaltokenapproved = isApproved.toString()
    if(totaltokenapproved.length > 2){
      console.log("approved", totaltokenapproved);

    }
    else{
      let _amount = ethers.utils.parseUnits("10000000000000000000", 18);
      let tx = await tokens.approve(values.stakingAddress, _amount);
      let receipt = await tx.wait();
      console.log("Approve tx receipt: ", receipt);
      }
    }
    catch(err){
     console.log(err)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setAmount(value);
    // console.log (amount);
  }


  const decimals = 18;

  return (
    <div>

    <div className='landing'>
        <div className='stak_box'>  
            <div className='stak_heading'>
                <h2>STAKE YOUR TOKEN</h2>
            </div>
            <div className="days">
            <button className={active === "0" ? "actived" : ""}  id="0"  onClick={(e) => {setPoolId(0); handleClick(e); setTEMPAPR(256)}  }>
              7 Days
            </button>
            <button className={active === "1" ? "actived" : ""} id="1" onClick={(e) => {setPoolId(1); handleClick(e); setTEMPAPR(292)}}>
              30 Days
            </button>
            <button className={active === "2" ? "actived" : ""} id="2" onClick={(e) => {setPoolId(2); handleClick(e); setTEMPAPR(347)}} >
              90 Days
            </button>
            <button className={active === "3" ? "actived" : ""} id="3" onClick={(e) => {setPoolId(3); handleClick(e); setTEMPAPR(548)}}>
              180 Days
            </button>
            <button className={active === "4" ? "actived" : ""} id="4" onClick={(e) => {setPoolId(4); handleClick(e); setTEMPAPR(1095)}}>
              365 Days
            </button>
          </div>
            <div className='stak_bar'>
            <Progress color="#339CEE" completed={((parseFloat(currentPoolSize)* 100)/parseFloat(maxPoolSize))} height={20} data-label={`${(parseInt(parseFloat(currentPoolSize)* 100)/parseFloat(maxPoolSize))}% Pool Filled`} />
            </div>
            {/* <Timer /> */}
            <div className='stak_info'>
            <p>Estimated APY : <span className='text-blue'>{TEMPAPR + `%`}</span></p>
            <p>My Balance : <span className='text-blue'>{balance}</span> </p>
            <p>My Staked Balance :  <span className='text-blue'>{stakingBalance}</span></p>
            </div>  

            <div className='inputs'>
         
            <div className='inputbox'>
            <div>
            <label>Stake Your Token</label>
            </div>
            <div className="input1">
            <input placeholder='Enter Token Amount' onChange= {(e)=> handleChange(e)} value= {amount} type="number" />
                <div className='maxToken'>
                <p onClick= {()=> setAmount(balance)} >MAX</p>
                </div>
                </div>
                <div className='inputbox'>
                {/* <div>
                <label>Staked Token</label>
                </div>
                <input placeholder={`Show Staked Amount`} readOnly/> */}
            </div>
            </div>
            </div>


            <div className='stak_info'>
            <p>Current Pool Size :  <span className='text-blue'>{currentPoolSize}</span></p>
            <p className='text-red'> {myerror}</p>
            
            {/* <p>My Total Claimed Token : <span className='text-blue'>{`632123`}</span></p>
            <p>Unstake Fee : <span className='text-blue'>{`0%`}</span></p> */}
            </div>
            {error ?
            <div className='error'> 
            {error}
            </div>  : ""}
            <div className='all_buttons'>
                <button className='greenButton' onClick={stakeTokens} >STAKE</button>
                <button className='greenButton' onClick={unstakeTokens}>UNSTAKE</button>
                <button className='redbutton' onClick={emergencyWithdraw}>EMERGENCY UNSTAKE</button>
            </div> 
            </div>
    </div>
    </div>
  )
}

export default Stake