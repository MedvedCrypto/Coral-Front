import { useEffect, useState } from "react";

import { getSigner, connectWallet } from "../js/wallet.js";
import { stringToPath } from "@cosmjs/crypto";


// const CHAIN = "harpoon-4"
const CHAIN = "dev-1"

async function getWallet() {
  try {
    const wallet = await detectWallet();
    if (wallet) {
      const { signer, owner } = await getSigner(CHAIN, wallet);
      console.log(owner)
      return { signer, owner };
    }
  } catch (error) {
    console.log(error);
  }
}

async function detectWallet() {
  console.log(localStorage.getItem("wallet"))
    if (localStorage.getItem("wallet") === "leap") {
      const leap = window.leap;
      if (!leap) throw new Error("You need to install Leap!");
      return leap;
    } else if (localStorage.getItem("wallet") === "keplr") {
      const { keplr } = window;
      
      if (!keplr) throw new Error("You need to install Keplr!");
      return keplr;
    } else {
      const { vultisig } = window;
      if (!vultisig) throw new Error("You need to install vultisig!");
    }

}

  



  const useWalletAddress = () => {
    const [ownerAddr, setOwnerAddr] = useState("");
    const [walletName, setConnectBtnText] = useState("connect");
    const [walletSigner, setSigner] = useState("");
  
    useEffect(() => {
      // const storedAddr = localStorage.getItem("walletAddress");
      // if (storedAddr) {
      //   setOwnerAddr(storedAddr);
      // }
  
      const keplrKeystoreChangeHandler = async () => {
        try {
          const keplr = await connectWallet(CHAIN);
          if (!keplr) {
            console.log("Keplr wallet not found");
            return;
          }
  
          const wallet = await getWallet();
          if (wallet) {
            const { owner, signer } = wallet;
            const accountKey = await keplr.getKey(CHAIN);
            setOwnerAddr(owner);
            setConnectBtnText(accountKey.name);
            setSigner(signer);
  
            localStorage.setItem("walletAddress", owner);
            localStorage.setItem("connect", "true");
          }
        } catch (error) {
          console.log(error);
        }
      };
  
      window.addEventListener("keplr_keystorechange", keplrKeystoreChangeHandler);
  
      return () => {
        window.removeEventListener("keplr_keystorechange", keplrKeystoreChangeHandler);
      };
    }, [ownerAddr]); 
  
    const btnConnect = async () => {

      try {

        const hdPath = stringToPath(`m/44'/931'/0'/0/0`);
        await window.keplr.experimentalSuggestChain({
          "chainId": "dev-1",
          "chainName": "dev-1",
          "rpc": "https://thornode-devnet-rpc.bryanlabs.net:443",
          "rest": "https://thornode-devnet-api.bryanlabs.net",
          "bip44": {
            "coinType": 931
          },
          "bech32Config": {
            "bech32PrefixAccAddr": "sthor",
            "bech32PrefixAccPub": "sthor",
            "bech32PrefixValAddr": "sthor",
            "bech32PrefixValPub": "sthor",
            "bech32PrefixConsAddr": "sthor",
            "bech32PrefixConsPub": "sthor"
          },
          "currencies": [
            {
              "coinDenom": "RUNE",
              "coinMinimalDenom": "rune",
              "coinDecimals": 8
            }
          ],
          "feeCurrencies": [
            {
              "coinDenom": "RUNE",
              "coinMinimalDenom": "rune",
              "coinDecimals": 8,
              "gasPriceStep": {
                "low": 0.01,
                "average": 0.02,
                "high": 0.05
              }
            }
          ],
          "stakeCurrency": {
            "coinDenom": "RUNE",
            "coinMinimalDenom": "rune",
            "coinDecimals": 8
          },
          "beta": true
        })

      console.log(window.keplr.experimentalSuggestChain)


        const keplr = await connectWallet(CHAIN);
        if (!keplr) {
          console.log("Keplr wallet not found");
          return;
        }
  
        const wallet = await getWallet();
        if (wallet) {
          const {owner, signer} = wallet;
          const accountKey = await keplr.getKey(CHAIN);
  
  
          setOwnerAddr(owner);
          setConnectBtnText(accountKey.name);
          setSigner(signer)
  
          localStorage.setItem("connect", "true")
  
  
  
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    const disconnectWallet = async () => {
      console.log("disconnectWallet", localStorage.getItem("connect"))
      localStorage.setItem("connect", "false")
      setSigner("")
      setConnectBtnText("connect")
      setOwnerAddr("")
      const wallet = await detectWallet();
      if(wallet){
        wallet.disable()
      }
    }
  
    return [ownerAddr, walletName, btnConnect, walletSigner, disconnectWallet];
  };

export default useWalletAddress;
