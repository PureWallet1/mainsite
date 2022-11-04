import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import "./navbar.scss"
import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Web3Modal from "web3modal";
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { ethers, providers } from "ethers";
import Box from '@mui/material/Box';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Dash from '../dashboard/Dash';
import logo from '../../images/logo.png'
import logologo from '../../images/longlogo.png'
import Account from '../account/Account';
import Stake from '../stake/Stake';
import * as Ai from 'react-icons/ai';
import { FaDiscord, FaTelegram, FaTelegramPlane, FaFacebook, FaInstagram, FaCross } from 'react-icons/fa'
import { AiOutlineClose } from 'react-icons/ai'
import { provider, setProvider, signer, setSigner } from '../../App';
import values from "../../values.json"
import Calculator from '../calculator/Calculator';
import Swap from '../swap/Swap';


function TabPanel(props) {

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

let swapUrl = "https://app.bogged.finance/bsc/swap?tokenIn=BNB&tokenOut=0x7E468E4b2fc43551fDd35B2196E094a421531129";



const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Account', href: '#', current: false },
  { name: 'Swap', href: swapUrl, current: false },
  { name: 'Vote & Proposal', href: '', current: false },
]



export default function Navbar(props) {

  let [address, setAddress] = useState("Connect");
  let [active, setActive] = useState("active_logout");

  let [connectedWallet, setConnectedWallet] = React.useState(false);
  let [walletAddress, setWalletAddress] = React.useState("Connect");


  let _provider = React.useContext(provider);
  let _setProvider = React.useContext(setProvider);
  let _signer = React.useContext(signer);
  let _setSigner = React.useContext(setSigner);

  const web3ModalRef = useRef(); // return the object with key named current

  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "binance",
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            rpc: {
              56: values.rpcUrl
            } // required
          }
        }
      },
    });


  }, []);

  useEffect(() => {

  }, [_provider, _signer]);


  const [value, setValue] = React.useState(0);
  const [swapis, setSwap] = React.useState(true);
  const [chainid, setChainid] = React.useState();

  React.useEffect(() => {
  }, []);

  const connectWallet = async () => {
    try {
      await getSignerOrProvider(true);
    } catch (error) {
      console.log(" error Bhai", error);
    }
  };


  const getSignerOrProvider = async (needSigner = false) => {
    try {
      const _provider = new providers.JsonRpcProvider(values.rpcUrl);
      _setProvider(_provider);
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      console.log("ChainId: ", chainId); setChainid(chainId)
      // Switch network to BSC
      if (chainId !== 56) {
        await web3Provider.send("wallet_switchEthereumChain", [{ chainId: "0x38" }]);
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        _setSigner(signer)
        let temp = await signer.getAddress();
        setWalletAddress(temp.toString());
      }
      setConnectedWallet(true);
      provider.on("accountsChanged", (accounts) => {
        console.log(accounts);
        connectWallet();
      });
    } catch (error) {
      console.log(error);
      const provider = new providers.JsonRpcProvider(values.rpcUrl);
      _setProvider(provider);
    }
  };

  let websiteUrl = "https://www.purewallet.finance/";



  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function disconnectWallet() {
    try {
      web3ModalRef.current.clearCachedProvider();
      window.localStorage.clear();
      setConnectedWallet(false);
      setWalletAddress('Connect')

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Disclosure as="nav" className="bg-[#000]">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 pr-2 sm:pr-10 navbar">
            <div className="relative flex items-center justify-between h-20 ">
              <div className="absolute inset-y-0 left-0 flex items-center lg:hidden navbutton">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white button_close menu">
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-start  sm:items-stretch sm:justify-start transition-property: all transition-duration:150ms">
                <div className="flex-shrink-0 flex items-center logo_mob">
                  <a href={websiteUrl}>
                    <img
                      className="block lg:hidden h-8 w-auto pl-10 logoimg mobilelogo_hide"
                      src={logologo}
                      alt="Workflow"

                    />
                    <img
                      className="block lg:hidden h-8 w-auto pl-10 logoimg mobilelogoreplace"
                      src={logo}
                      alt="Workflow"
                    />
                  </a>


                </div>

              </div>
              <div className="buttonblock">


                <button className="buynowbutton" onClick={() => setSwap(false)}>Swap</button>

                <button
                  className='connect_button' id="walletconnect"
                  onClick={connectWallet}
                >{(connectedWallet) ? <>{walletAddress.slice(0, 6) + "..."}</>
                  :
                  <>Connect</>}</button>

                {connectedWallet ?
                  <div className="logout" onClick={(e) => disconnectWallet()}>logout</div>
                  :
                  <></>}
              </div>
            </div>
          </div>


          <Disclosure.Panel className="lg:hidden panel">
            <div className="px-2 pt-2 pb-3 space-y-1">

              <div className="flex-shrink-0 flex items-center logo_mob disclose_logo">

                <div className='sidebar_logo'>
                  <a href={websiteUrl}>
                    <img
                      className="block lg:hidden h-8 w-auto pl-10 logoimg logoimg_disclose"
                      src={logologo}
                      alt="Workflow"
                    />
                  </a>
                  <AiOutlineClose className='cross_icon' color='#fff' fontSize={20} onClick={() => {
                    const close = document.getElementById('headlessui-disclosure-button-1')
                    close.click();
                  }} />
                </div>


              </div>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: 'divider', fontSize: '100px' }}
              >
     <Tab label={<div className="icon_nav"><Ai.AiFillCalculator className='icon_nav_main' /> Calculator</div>}
                  onClick={() => {
                    const close = document.getElementById('headlessui-disclosure-button-1')
                    close.click();
                    setSwap(true)
                  }} {...a11yProps(0)} />

                <Tab label={<div className="icon_nav"><Ai.AiFillDashboard className='icon_nav_main' /> Dashboard</div>} onClick={() => {
                  const close = document.getElementById('headlessui-disclosure-button-1')
                  close.click();
                  setSwap(true)
                }}
                  {...a11yProps(1)} />
                <Tab label={<div className="icon_nav"><Ai.AiFillAccountBook className='icon_nav_main' /> Account</div>}
                  onClick={() => {
                    const close = document.getElementById('headlessui-disclosure-button-1')
                    close.click();
                    setSwap(true)
                  }} {...a11yProps(2)} />






                <Tab label={<div className="icon_nav"><Ai.AiFillThunderbolt className='icon_nav_main' /> Stake</div>} onClick={() => {
                  const close = document.getElementById('headlessui-disclosure-button-1')
                  close.click();
                  setSwap(true)
                }} {...a11yProps(4)} />

           


                <div className='icon_nav extra_task' onClick={() => {
                  setSwap(false)
                  const close = document.getElementById('headlessui-disclosure-button-1')
                  close.click()
                }
                }><Ai.AiOutlineSwap className='icon_nav_main' /><h2 className='swap swap_size'>Swap</h2></div>
                <a href={websiteUrl} target="_blank"><div className='icon_nav extra_task'><Ai.AiOutlineChrome className='icon_nav_main' /><h2 className='swap swap_size'>Website</h2></div></a>



                <div className='socials'>
                  <a href="https://t.me/PureWalletOfficial"> <FaTelegram className='social_icon social_mobile' /></a>
                  <a href="https://twitter.com/pure_wallet"> <Ai.AiFillTwitterCircle className='social_icon social_mobile' /> </a>
                  <a href="https://discord.com/invite/jKqCm9yeTn"> <FaDiscord className='social_icon social_mobile' /> </a>
                  <a href="https://www.facebook.com/PureWalletOfficial/"> <FaFacebook className='social_icon social_mobile' /> </a>
                  <a href="https://www.instagram.com/purewalletofficial/"> <FaInstagram className='social_icon social_mobile' /> </a>
                </div>
              </Tabs>
            </div>
          </Disclosure.Panel>

          <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
          >

            <div className='left_navbar'>
              <div className="trui">
                <a href={websiteUrl}>
                  <img src={logo} alt='logo' className='logo' />
                </a>
                <p className='logo_text'>PUREWALLET</p>

                <div className='left_content'>

                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                  >
                    <Tab label={<div className="icon_nav"><Ai.AiFillAccountBook className='icon_nav_main' /> Calculator</div>}{...a11yProps(0)} onClick={() => { setSwap(true) }} />

                    <Tab label={<div className="icon_nav"><Ai.AiFillDashboard className='icon_nav_main' /> Dashboard</div>} {...a11yProps(1)} onClick={() => { setSwap(true) }} />
                    <Tab label={<div className="icon_nav"><Ai.AiFillAccountBook className='icon_nav_main' /> Account</div>}  {...a11yProps(2)} onClick={() => { setSwap(true) }} />
                    <Tab label={<div className="icon_nav"><Ai.AiFillThunderbolt className='icon_nav_main' /> Stake</div>}  {...a11yProps(3)} onClick={() => { setSwap(true) }} />
                    <a href={websiteUrl} target="_blank"><div className='icon_nav extra_task'><Ai.AiOutlineGlobal className='icon_nav_main ' /><h2 className='swap swap_size'>Website</h2></div></a>
                    <div className='socials'>
                      <a href="https://t.me/PureWalletOfficial"> <FaTelegram className='social_icon' /></a>
                      <a href="https://twitter.com/pure_wallet"> <Ai.AiFillTwitterCircle className='social_icon' /> </a>
                      <a href="https://discord.com/invite/jKqCm9yeTn"> <FaDiscord className='social_icon' /> </a>
                      <a href="https://www.facebook.com/PureWalletOfficial/"> <FaFacebook className='social_icon' /> </a>
                      <a href="https://www.instagram.com/purewalletofficial/"> <FaInstagram className='social_icon' /> </a>

                    </div>

                  </Tabs>

                </div>
              </div>
            </div>
            {swapis ?
              <div className='right_content'>
                           <TabPanel value={value} index={0}>
                  <Calculator />
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Dash />
                </TabPanel>
                <TabPanel value={value} index={2}>
                  <Account />
                </TabPanel>

                <TabPanel value={value} index={3}>
                  <Stake />
                </TabPanel>
    

              </div> : <Swap chainId={chainid} provider={_provider} useraddress={walletAddress} />}


          </Box>

        </>
      )}
    </Disclosure>


  )
}
