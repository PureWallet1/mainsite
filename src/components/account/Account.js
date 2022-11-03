import * as React from 'react'
import './account.scss'
import {provider, setProvider, signer, setSigner} from '../../App';
import values from "../../values.json"
import routerAbi from '../../abi/router.json'
import tokenAbi from '../../abi/token.json'
import stakingAbi from '../../abi/staking.json';
import addresses from '../../abi/addresses.json';
import { ethers } from "ethers";


const Account = () => {

  let [balance, setBalance] = React.useState(0);
  let [price, setPrice] = React.useState(0);
  let [bnbPrice, setBnbPrice] = React.useState(0);
  let [poolId, setPoolId] = React.useState(0);
  let [userInfo, setUserInfo] = React.useState([]);
  let [stakingBalance, setStackingBalance] = React.useState(0);
  let [timeLock, setTimeLock] = React.useState(0);
  let [claimedReward, setClaimedReward] = React.useState(0);
  let [poolLength, setPoolLength] = React.useState(0);
  let [totalReward, setTotalReward] = React.useState(0);
  let _provider = React.useContext (provider);
  let _setProvider = React.useContext (setProvider);
  let _signer = React.useContext (signer);
  let _setSigner = React.useContext (setSigner);




  let [rewardBalance, setRewardBalance] = React.useState(0);
  let [totalTokenStaked, settotalTokenStaked] = React.useState(0);
  let [owntotalStaked, setOwnTotalStaked] = React.useState(0);
  let [walletAddressTest, setWalletAddressesForTest] = React.useState(0);
  let [totalClaimed, setTotalClaimed] = React.useState(0);
  const decimals = 18;


  React.useEffect(() => {
    getUserInfo();
    getTotalPools();


    try{
      async function fetchData(){
        getPrice();
        let _balance = await _getBalance(values.token);
        setBalance(_balance);

      }
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, [_provider, _signer]);




  

  async function getPrice(){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let router = new ethers.Contract(
        values.router,
        routerAbi,
        provider_
      );
      const tokenIn = values.token;
      const tokenOut = values.wbnb;
      
      const amountIn = ethers.utils.parseUnits("1",  decimals);
      let amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      let busd = values.busd;
      let amounts2 = await router.getAmountsOut(amounts[1], [tokenOut, busd]);
      console.log(`
          tokenIn: ${ethers.utils.formatEther(amountIn.toString())} ${tokenIn} (safeearn)
          tokenOut: ${ethers.utils.formatEther(amounts2[1].toString())} ${busd} (BUSD)
        `);
      setPrice(parseFloat(ethers.utils.formatEther(amounts2[1].toString())).toFixed(8));
    } catch (err) {
      console.log (err);
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
      let decimals = await token.decimals();
      decimals = parseInt(decimals.toString());
      balance = ethers.utils.formatUnits(balance, decimals);
      console.log ("balance", balance.toString());
      return parseFloat(balance.toString()).toFixed(2);
    } catch (err){
      console.log (err, tokenAddress);
      return 0;
    }
  }



  async function getTotalPools (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      var poolLength = await staking.poolLength();
      console.log ("Pool length: ", poolLength.toString());
      setPoolLength(poolLength.toString());

      for(let i=0; i<poolLength; i++){
        try{
          // total reward awailaible 
          var _poolInfo = await staking.poolInfo(i);
          let rewardamount = ethers.utils.formatUnits(_poolInfo[5],  decimals)
          rewardBalance += parseInt(rewardamount);
          console.log(rewardamount);
          setRewardBalance(rewardamount);

          // total token staked 
          let tokenstaked = ethers.utils.formatUnits(_poolInfo[4],  decimals)
          totalTokenStaked += parseInt(tokenstaked);
          console.log(totalTokenStaked);
          settotalTokenStaked(tokenstaked);


          // total own token staked
          let _wallet = await _signer.getAddress(); 
          setWalletAddressesForTest(_wallet);
          console.log(_wallet + walletAddressTest)
          
          if(_wallet === walletAddressTest){
            console.log('wallet same')
          }
          else{
          var _userinfo = await staking.userInfo(i, _wallet);
          let userstakedAmount = ethers.utils.formatUnits(_userinfo[0],  decimals)
          owntotalStaked += parseInt(userstakedAmount);
          setOwnTotalStaked(owntotalStaked)

          // total claimed
          let totalclaimede = ethers.utils.formatUnits(_userinfo[2],  decimals)
          totalClaimed += parseInt(totalclaimede);
          setTotalClaimed(totalClaimed)
          }

        }catch(err){
          console.log(err);
        }
      }

      console.log('total Reward Balance ' + rewardBalance)
      console.log('total Staked Balance ' + totalTokenStaked)
      console.log('own Staked Balance ' + owntotalStaked)

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
      setStackingBalance(ethers.utils.formatUnits(_userInfo[0],  decimals).toString())
      setUserInfo(_userInfo);
      let _timestamp = parseInt(_userInfo[1].toString())* 1000 ;
      let _time = new Date(_timestamp);
      if (_timestamp >0) setTimeLock(_time);
      else setTimeLock(" Not staked yet");
      let _claimedReward = ethers.utils.formatUnits( _userInfo[2],  decimals).toString();
      setClaimedReward(_claimedReward);
    }catch(err){
      console.log("User error", err);
    }
  }

  

  return (
    <div className='container'>

      {/* last block */}      
      <div className="block3">
      <div className='inner_block3'>
      <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Your Balance</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${parseFloat(balance)* (parseFloat(price).toFixed(3))}</h2>
            </div>
            <div className='card_title'>
            <h2> {balance} PURE</h2></div>
          </div>
      </div>

      <div className='inner_block3'>
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Your Staked Balance</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${(parseFloat(owntotalStaked) * parseFloat(price)).toFixed(3)}</h2>
            </div>
            <div className='card_title'>
              <h2>{parseFloat(owntotalStaked).toFixed(2)} PURE</h2>
            </div>
          </div>
      </div>
       
      <div className='inner_block3'>
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Claimed USD Rewards</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${(parseFloat(totalClaimed) * parseFloat(bnbPrice)).toFixed(2)}</h2>
            </div>
            <div className='card_title'>
              <h2>{parseFloat(totalClaimed).toFixed(2)} PURE</h2>
            </div>
          </div>
      </div>
      <div className='inner_block3'>
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Total Token Staked</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${((parseFloat(totalTokenStaked) * parseFloat(bnbPrice))).toFixed(2)}</h2>
            </div>
            <div className='card_title'>
              <h2>{(parseFloat(totalTokenStaked).toFixed(2))} PURE</h2>
            </div>
          </div>
      </div>
      <div className='inner_block3'>
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Total Reward Pool</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${(parseFloat(rewardBalance) * parseFloat(bnbPrice)).toFixed(2)}</h2>
            </div>
            <div className='card_title'>
              <h2>{parseFloat(rewardBalance).toFixed(2)} PURE</h2>
            </div>
          </div>
      </div>

      </div>
     

    </div>
  )
}

export default Account;