import * as React from 'react'
import './dash.scss'
import {provider, setProvider, signer, setSigner} from '../../App';
import values from "../../values.json"
import routerAbi from '../../abi/router.json'
import tokenAbi from '../../abi/token.json'
import addresses from '../../abi/addresses.json'
import { ethers } from "ethers";

const Dash = () => {
  let [price, setPrice] = React.useState(0);
  let [balance, setBalance] = React.useState(0);
  let [burn, setBurn] = React.useState(0);
  let [totalSupply, setTotalSupply] = React.useState(0);
  let [apy, setAPY] = React.useState(0);
  let [currencyExchange, setCurrencyExchange] = React.useState(0);
  let [marketingWallet, setMarketingWallet] = React.useState(0);
  let [treasuryWallet, setTreasuryWallet] = React.useState(0);
  let [poolBalance, setPoolBalance] = React.useState(0);

  let [connectedWallet, setConnectedWallet] = React.useState(false);
  let [walletAddress, setWalletAddress] = React.useState("");
  let _provider = React.useContext (provider);
  let _setProvider = React.useContext (setProvider);
  let _signer = React.useContext (signer);
  let _setSigner = React.useContext (setSigner);

  React.useEffect(() => {

    async function fetchData(){
      getPrice();
      getTotalSupply();
      let _balance = await _getBalance(values.token);
      let _burn = await _getBalance(values.token, values.dead);
      setBalance(_balance);
      console.log ("BURn:", _burn);
      setBurn(_burn);
      let _marketingWallet = await getBnbBalance(values.marketingwallet);
      let _treasuryWallet = await getBnbBalance(values.treasurywallet);
      let _poolBalance = await getBnbBalance(values.pool);

      setMarketingWallet(_marketingWallet);
      setTreasuryWallet(_treasuryWallet);
      setPoolBalance(_poolBalance);
    }
    fetchData();

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

      
      const amountIn = ethers.utils.parseUnits("1", 18);
      let amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      let busd = values.busd;
      let amounts2 = await router.getAmountsOut(amounts[1], [tokenOut, busd]);
      console.log(`
          tokenIn: ${ethers.utils.formatEther(amountIn.toString())} ${tokenIn} (safeearn)
          tokenOut: ${ethers.utils.formatEther(amounts2[1].toString())} ${busd} (BUSD)
        `);
      setPrice(parseFloat(ethers.utils.formatEther(amounts2[1].toString())).toFixed(8));
      setCurrencyExchange(parseFloat(ethers.utils.formatEther(amounts2[1].toString())).toFixed(8));
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

  async function getTotalSupply (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let token = new ethers.Contract(
        values.token,
        tokenAbi,
        provider_
      );
      let supply = await token.totalSupply();
      console.log("Supply", supply.toString());
      let decimals = await token.decimals();
      decimals = parseInt(decimals.toString());
      supply = ethers.utils.formatUnits(supply, decimals);
      setTotalSupply(parseInt(supply));
    } catch (err) {
      console.log(err);
    }
  }

  async function getBnbBalance (_address) {
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let _balance = await provider_.getBalance(_address);
      let router = new ethers.Contract(
        values.router,
        routerAbi,
        provider_
      );
      const tokenIn = values.wbnb;
      
      let busd = values.busd;
      let amounts2 = await router.getAmountsOut(_balance, [tokenIn, busd]);
      return (parseFloat(ethers.utils.formatEther(amounts2[1].toString())).toFixed(8));
    }catch (err) {
      console.log (err);
      return 0;
    }
  }

  return (
    <div className='container container_dashboard'>
      <div className="block1">
        <div className="inner_block1">
          <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Token Price</h2>
            </div>
            <div className="card_value">
             <h2>${parseFloat(price).toFixed(3)}</h2>
            </div>
          </div>
        </div>
        <div className="inner_block1">
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Market Cap</h2>
            </div>
            <div className="card_value">
             <h2>${parseInt(price * totalSupply).toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="inner_block1">
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Circulating Supply</h2>
            </div>
            <div className="card_value">
             <h2>{parseFloat((0.8636 * totalSupply).toFixed(2)).toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="inner_block1">
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Backed Liquidity</h2>
            </div>
            <div className="card_value">
             <h2>100%</h2>
            </div>
          </div>
        </div>
        <div className="inner_block1">
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Pool Value</h2>
            </div>
            <div className="card_value">
            <h2>${poolBalance}</h2>
            </div>
          </div>
        </div>
        <div className="inner_block1">
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Total Supply</h2>
            </div>
            <div className="card_value">
             <h2>{totalSupply.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>



{/* second block started */}



      <div className="block2">
      <div className='inner_block2'>
      <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Your Balance</h2>
            <div className="card_value">
             <h2>{balance} PURE</h2>
            </div>
            </div>
            <div className="card_value">
            </div>
          </div>
      </div>

      <div className='inner_block2'>
      <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Total Tokens burned</h2>
            </div>
            <div className="card_value">
             <h2>{parseFloat(burn).toLocaleString()} PURE</h2>
            </div>
          </div>
      </div>

      </div>

      {/* third block started */}


      
    


  
    </div>
  )
}

export default Dash