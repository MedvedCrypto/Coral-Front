import { Keplr } from "@keplr-wallet/types";
import {
  connectWallet,
  disconnectWallet,
  getSigner,
  getAccountAddress,
  detectWallet,
  getChainList,
  getGasPriceFromChainRegistryItem,
} from "../js/wallet.ts";
import { Chain } from "@chain-registry/types";

// Функция подключения кошелька
export const connectWalletApi = async (network: string) => {
  return await connectWallet(network);
};

// Функция отключения кошелька
export const disconnectWalletApi = async () => {
  return await disconnectWallet();
};

// Получение подписывающего (signer)
export const getSignerApi = async (wallet: Keplr, chainId: string) => {
  return await getSigner(wallet, chainId);
};

// Получение адреса аккаунта
export const getAccountAddressApi = async (wallet: Keplr, chainId: string) => {
  return await getAccountAddress(wallet, chainId);
};

// Обнаружение кошелька
export const detectWalletApi = async () => {
  return detectWallet();
};

// Получение списка цепочек
export const getChainListApi = async (chainIdList: string[]) => {
  return getChainList(chainIdList);
};

// Получение цены газа из элемента реестра цепочки
export const getGasPriceFromChainRegistryItemApi = async (
  chainRegistryItem: Chain,
) => {
  if (chainRegistryItem) {
    return await getGasPriceFromChainRegistryItem(chainRegistryItem);
  }
};
