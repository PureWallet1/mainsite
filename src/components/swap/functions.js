import axios from "axios";
import { ethers, providers } from "ethers";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import toast from 'react-hot-toast';



export const FetchToken = async () => {
    /* Step 1 : Lookup addresses of tokens you want to swap */
    let response = await fetch('https://api.1inch.exchange/v4.0/56/tokens');
    let tokenListJSON = await response.json();
    //console.log("Look Up Address=> ", tokenListJSON);
}

export const CheckAllowance = async (walletaddress, tokentoaddress) => {
    /* Step 2 : Check for allowance of 1inch router contract to spend source asset */
    let allowanceendpoint = `https://api.1inch.exchange/v4.0/56/approve/allowance?tokenAddress=${tokentoaddress}&walletAddress=${walletaddress}`
    try {
        const response = await axios.get(allowanceendpoint);
        //console.log("Allowance=>", response.data)
    } catch (err) {
        //console.log("Error=>", err.message)
    }
    return;
}

export const ApproveFunction = async (walletaddress, amount, tokenfromaddress, tokentoaddress, wallet) => {
    /* Step 3 : If necessary, give approval for 1inch router to spend source token */
    let loading = toast.loading("Please Wait until the contract gets approved")
    const prices = ethers.utils.parseUnits(amount.toString(), 'ether')
    let approvalendpoint = `https://api.1inch.exchange/v4.0/56/approve/transaction?tokenAddress=${tokentoaddress}&amount=${prices.toNumber()}`
    try {
        const response = await axios.get(approvalendpoint);
        console.log("Response=>", response)
        /* If the User connction wallet is metamask the function will execute */
        if (wallet === "wallet") {
            try {
                const sendmetamask = response.data;
                try {
                    const { ethereum } = window;
                    await ethereum.request({ method: "eth_requestAccounts" });
                    const accounts = await ethereum.request({ method: "eth_accounts" });
                    const chainId = await ethereum.request({ method: "eth_chainId" });
                    sendmetamask.from = accounts[0];
                    sendmetamask.gasPrice = "2000000000";
                    try {
                        const transaction = await window.ethereum.request({
                            method: "eth_sendTransaction",
                            params: [sendmetamask],
                        });
                        console.log('Response Meta=>', transaction);
                        toast.success("Transaction Approved, Please Wait...")
                        SwapTokens(walletaddress, amount, tokenfromaddress, tokentoaddress, wallet)
                    } catch (error) {
                        toast.dismiss(loading)
                        console.log("Error=>", error)
                    }
                }
                catch (error) {
                    toast.dismiss(loading)
                    console.log("Error=>", error)
                }

            } catch (err) {
                toast.dismiss(loading)
                console.log("Error=>", err.message)
            }
        } else {
            /*If the wallet not equal to metamask it goes to wallet connect function */
            const sendmetamask = response.data;
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            if (!connector.connected) {
                // create new session
                connector.createSession();
                connector.on("connect", (error, payload) => {
                    if (error) {
                        throw error;
                    }
                    // Get provided accounts and chainId
                    const { accounts, chainId } = payload.params[0];
                    const account = accounts[0]
                    console.log(account);
                    alert("Please Click again to Initiate the Transaction...")
                });
            }
            else {
                sendmetamask.from = walletaddress;
                connector.sendTransaction(sendmetamask).then((swapresult) => {
                    console.log('Swap Result', swapresult);
                })
                    .catch((error) => {
                        toast.dismiss(loading)
                        console.error('sell error', error);
                    });
            }
        }
        toast.success("Transaction Approved, Please Wait...")
        toast.dismiss(loading)
    } catch (err) {
        toast.dismiss(loading)
        //console.log("Error=>", err.message)
    }
}

export const SwapTokens = async (walletaddress, amount, tokenfromaddress, tokentoaddress, wallet) => {
    const qs = require('qs');
    toast.loading("Initiating Transaction...")
    
        /* Step 5 : All Success ready use to perform swap */
        const params = {
            "sellToken": tokenfromaddress,
            "buyToken": tokentoaddress,
            "sellAmount": (ethers.utils.parseEther(amount)).toString(),
          }  
        const response = await fetch(`https://bsc.api.0x.org/swap/v1/quote?${qs.stringify(params)}`);
        const data = await response.json();
        /* If the User connction wallet is metamask the function will execute */
        if (wallet === "wallet") {
            try {
                const sendmetamask = data;
                try {
                    toast.dismiss()
                    let loading = toast.loading("Please Wait until the contract gets approved")
                    const { ethereum } = window;
                    await ethereum.request({ method: "eth_requestAccounts" });
                    const accounts = await ethereum.request({ method: "eth_accounts" });
                    const chainId = await ethereum.request({ method: "eth_chainId" });
                    sendmetamask.from = accounts[0];
                    sendmetamask.gasPrice = "2000000000";
                    try {
                        const transaction = await window.ethereum.request({
                            method: "eth_sendTransaction",
                            params: [sendmetamask],
                        });
                        console.log('Response Meta=>', transaction);
                        toast.dismiss(loading)
                        toast.success("Swap Transaction Success....");
                    } catch (error) {
                        console.log("Error=>", error)
                        toast.dismiss(loading)
                        toast.error("Swap Transaction Failed....");
                    }
                }
                catch (error) {
                    console.log("Error=>", error)
                }

            } catch (err) {
                console.log("Error=>", err.message)
            }
        } else {
            /*If the wallet not equal to metamask it goes to wallet connect function */
            toast.dismiss()
            let loading = toast.loading("Please Wait until the contract gets approved")
            const sendmetamask = data;
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            if (!connector.connected) {
                // create new session
                connector.createSession();
                connector.on("connect", (error, payload) => {
                    if (error) {
                        throw error;
                    }
                    // Get provided accounts and chainId
                    const { accounts, chainId } = payload.params[0];
                    const account = accounts[0]
                    console.log(account);
                    alert("Please Click again to Initiate the Transaction...")
                });
            }
            else {
                sendmetamask.from = walletaddress;
                await connector.sendTransaction(sendmetamask).then((swapresult) => {
                    console.log('Swap Result', swapresult);
                    toast.success("Swap Transaction Success....");
                    toast.dismiss(loading)
                })
                    .catch((error) => {
                        console.error('sell error', error);
                        toast.dismiss(loading)
                        toast.error("Swap Transaction Failed....");
                    });
            }
            
        }
    
}
