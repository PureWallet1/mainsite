import * as React from 'react';
import { ethers } from "ethers";
import './calculator.scss'
import CustomizedSlider from './Slider';
import routerAbi from '../../abi/router.json'
import tokenAbi from '../../abi/token.json'
import { red } from '@material-ui/core/colors';

const Calculator = () => {

  const [tokenAmount, setTokenAmount] = React.useState(0);
  const [apy, setApy] = React.useState(500);
  let [price, setPrice] = React.useState(0.000);
  let [balance, setBalance] = React.useState(0);
  const [previousPrice, setPreviousPrice] = React.useState(0);
  const [futurePrice, setFuturePrice] = React.useState(0);
  const [days, setDays] = React.useState(20);
  
  let finalTokens = 0;
  

  React.useEffect(() => {
    try{
      getPrice()
      getBalance()
    } catch (error){
      console.log(error);
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "tokenAmount") setTokenAmount(value);
    else if (name === "apy") setApy(value);
    else if (name === "previousPrice") setPreviousPrice(value);
    else if (name === "futurePrice") setFuturePrice(value);
  }

  finalTokens = ((tokenAmount * apy *  days) / 100 * 365) + (tokenAmount)

  async function getPrice(){
    let rpcUrl = "https://bsc-dataseed1.defibit.io/";
    let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
    let router = new ethers.Contract(
      '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      routerAbi,
      provider_
    );
    const tokenIn = '0xc3BcE47886e56316B2A5A4b2C926561AE94039A2';
    const tokenOut = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
    const amountIn = "100000";
    let amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    let busd = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
    let amounts2 = await router.getAmountsOut(amounts[1], [tokenOut, busd]);
    console.log(`
        Buying new token
        =================
        tokenIn: ${ethers.utils.formatEther(amountIn.toString())} ${tokenIn} (Amber)
        tokenOut: ${ethers.utils.formatEther(amounts2[1].toString())} ${busd} (BUSD)
      `);
    setPrice(ethers.utils.formatEther(amounts2[1].toString()));
  }

  async function getBalance (){
    try {
      let rpcUrl = "https://bsc-dataseed1.defibit.io/";
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let token = new ethers.Contract(
        '0xc3BcE47886e56316B2A5A4b2C926561AE94039A2',
        tokenAbi,
        provider_
      );
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []).catch((error) => {
          console.log(error);
      })
      let signer = provider.getSigner();
      const walletAddress = await signer.getAddress();
      let balance = await token.balanceOf (walletAddress);
      setBalance(balance.div('100000').toString());
      console.log ("balance", balance.toString());
    } catch (err){
      console.log (err);
    }
  }

  return (
    <div className='calculator_outer'>
        <div className='container'>
            <div className='topic_calculator'>
               <h2>Calculator</h2>
               <p>Estimate your returns</p>
            </div>
            <div className="block_calculator">
      <div className='inner_block_calculator'>
      <div className='dashboard-card'>
            <div className='card_title'>
            <h2>TOKEN Price</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>${parseFloat(price).toFixed(2)}</h2>
            </div>
          </div>
      </div>

     
        <div className='inner_block_calculator'>
        <div className='dashboard-card'>
            <div className='card_title'>
            <h2>Your Balance</h2>
            </div>
            <div className="card_value card_value_acc">
             <h2>{balance}</h2>
            </div>
          </div>
      </div>

      </div>               
    </div>

{/* input block */}


    <div className='outer_input'>
        <div className='input_inner'>
            <div className='title_input'>
                <h2 className='input_title'>Token Amount</h2>
            </div>
            <div className='inputbox'>
            <input placeholder='0' className='input_main' name= "tokenAmount" onChange={handleChange} value={tokenAmount} />
            </div>
        </div>

        <div className='input_inner'>
            <div className='title_input'>
                <h2 className='input_title'>APY (%)</h2>
            </div>
            <div className='inputbox'>
            <input type="number" placeholder='500' className='input_main' name= "apy" onChange={handleChange} value={apy}  max="1200" min="400"/>
            </div>
        </div>

        <div className='input_inner'>
            <div className='title_input'>
                <h2 className='input_title'>PURE Price at purchase ($)</h2>
            </div>
            <div className='inputbox'>
            <input placeholder='0' className='input_main' name= "previousPrice" onChange={handleChange} value={previousPrice} />
            </div>
        </div>

        <div className='input_inner'>
            <div className='title_input'>
                <h2 className='input_title'>Future PURE market price ($)</h2>
            </div>
            <div className='inputbox'>
            <input placeholder='0' className='input_main' name= "futurePrice" onChange={handleChange} value={futurePrice} />
            </div>
        </div>



{/* last block */}


    </div>

<div className='slider'>
<CustomizedSlider days= {days} setDays= {setDays} />
</div>

<div className='block4 info_calculator'>
          <div className="row">
            <div className='title_card'>
                <h2>Your initial investment</h2>
            </div>

            <div className='value value_calculator'>
            <h2>${tokenAmount * previousPrice}</h2>
            </div>
          </div>

          <div className="row">
            <div className='title_card'>
            <h2>Current wealth</h2>
            </div>

            <div className='value value_calculator '>
            <h2>${tokenAmount * previousPrice}</h2>
            </div>
          </div>



          <div className="row">
            <div className='title_card'>
                <h2>Token rewards estimation</h2>
            </div>

            <div className='value value_calculator'>
            <h2>{(finalTokens - tokenAmount).toFixed(3)} Token</h2>
            </div>
          </div>



          <div className="row">
            <div className='title_card'>
            <h2>Potential return</h2>
            </div>

            <div className='value value_calculator'>
            <h2>${(finalTokens* futurePrice).toFixed(3)}</h2>
            </div>
          </div>



          <div className="row">
            <div className='title_card'>
        <h2>ROI(1-Day Rate) %</h2>
            </div>

            <div className='value value_calculator'>
            <h2>{apy/365 + `%`}</h2>
            </div>
          </div>






      </div>
    </div>
  )
}

export default Calculator