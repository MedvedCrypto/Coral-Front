import { assets, chains } from "chain-registry";
import { chainRegistryChainToKeplr } from "@chain-registry/keplr";
import { getGasPriceFromChainRegistryItem } from "../common/account/clients";


function detectWallet() {
  if (localStorage.getItem("wallet") === "leap") {
    const { leap } = window;
    if (!leap) throw new Error("You need to install Leap!");
    return leap;
  } else {
    const { keplr } = window;
    if (!keplr) throw new Error("You need to install Keplr!");
    return keplr;
  }
}

function getChainList(chainIdList) {
  return chains.filter(({ chain_id }) => chainIdList.includes(chain_id));
}

async function addChainList(wallet, chainIdList) {
  for (const chain of getChainList(chainIdList)) {
    try {
      const chainInfo = chainRegistryChainToKeplr(chain, assets);
      await wallet.experimentalSuggestChain(chainInfo);
    } catch (error) {
      console.log(error);
    }
  }
}

async function unlockWalletList(wallet, chainIdList) {
  try {
    await wallet.enable(chainIdList);
  } catch (error) {
    console.log(error);
  }
}

async function initWalletInterchain(chainIdList) {
  const wallet = detectWallet();
  const keplrConnected = localStorage.getItem("keplrConnected");


  if (!keplrConnected) {
    await addChainList(wallet, chainIdList);
    await unlockWalletList(wallet, chainIdList);
  }

  return wallet;
}

async function getAccountAddress(wallet, chainId) {
  return (await wallet.getKey(chainId)).bech32Address;
}

async function getSigner(chainId, wallet) {
  if (localStorage.getItem("wallet") === "leap") {
    const signer = window.leap.getOfflineSignerOnlyAmino?.(chainId);
    const owner = (await wallet.getKey(chainId)).bech32Address;

    return { signer, owner };
  } else {
    const signer = window.getOfflineSignerOnlyAmino?.(chainId);
    window.keplr.defaultOptions = {
      sign: {
          preferNoSetFee: true,
      }
  }
    const owner = (await wallet.getKey(chainId)).bech32Address;

    

    unlockWalletList(wallet, chainId)


    return { signer, owner };
  }
}

async function connectWallet() {

  return await initWalletInterchain(["harpoon-4"]);
}

async function disconnectWallet() {
  const wallet = detectWallet();
  /* wallet.disable() */
}

export {
  connectWallet,
  disconnectWallet,
  getSigner,
  getAccountAddress,
  detectWallet,
  getChainList,
  getGasPriceFromChainRegistryItem,
};
