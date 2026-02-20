import * as stargazeCwHelpers from "../common/account/cw-helpers";
import * as LendingPlatformTypes from "../common/codegen/LendingPlatform.types.ts";
import { CHAIN, RPC } from "../common/config/index.ts";
import { Metadata } from "../common/interfaces/IMetadata";

// КВЕРЬ БАЛАНСОВ //

const queryBalances = async (market: string) => {
  const cwQueryBalances = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryBalances;

  const data = await cwQueryBalances(market);
  console.log(data)
  return data;
};

const queryDeposited = async () => {
  const data = await queryBalances();
  return data.regular.deposited;
};

const queryUnbonded = async () => {
  const data = await queryBalances();
  return data.regular.unbonded;
};

const queryUnbondedByAddress = async (owner: string) => {
  const cwQueryBalances = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryUnbonder;

  const data = await cwQueryBalances("main", owner);
  return data;
};

const QueryConditionalDepositApr = async (market: string) => {
  const cwQueryBalances = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryConditionalDepositApr;

  const data = await cwQueryBalances(market, 1);
  console.log(data)
  return data;
};

const QueryCollateralByOwner = async (owner: string) => {
  const query = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCollateralByOwner;

  const data = await query("main", owner);
  return data;
};




const queryUserInfo = async (owner: string, market: string) => {
  const cwQueryUserInfo = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryUserInfo;

  const data = await cwQueryUserInfo(market, owner);
  return data;
};


const queryUserInfoAfterAction = async (market: string, owner: string, action: any) => {
  //depositAmount
  //withdrawAmount
  //amountToBorrow
  //amountToRepay
  const queryConditionalLtv = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryConditionalLtv;

  let data;

  // Проверяем тип действия
  if (action.depositAmount !== undefined) {
    data = await queryConditionalLtv(market, owner, action.depositAmount);
  } else if (action.withdrawAmount !== undefined) {
    data = await queryConditionalLtv(market, owner, undefined, action.withdrawAmount);
  } else if (action.amountToBorrow !== undefined) {
    data = await queryConditionalLtv(market, owner, undefined, undefined, action.amountToBorrow);
  } else if (action.amountToRepay !== undefined) {
    data = await queryConditionalLtv(market, owner, undefined, undefined, undefined, action.amountToRepay);
  }

  console.log(market, owner, action); // Вывод параметров

  // Проверяем, что amount равно 0
  if (action.amountToBorrow === 0 || action.amountToRepay === 0) {
    return 0; // Возвращаем 0, если amount = 0
  }

  return data; // Возвращаем полученные данные
};


const queryBalancesByOwner = async (owner: string) => {
  try {
    const response = await fetch(`https://rest.testcosmos.directory/stargazetestnet/cosmos/bank/v1beta1/balances/${owner}`);
    const data = await response.json();

    const tokenBalances: { bglToMainCur[key: string]: string } = {};
    data.balances.forEach((balance: { denom: string; amount: string; }) => {
      let tokenName = balance.denom;
      if (tokenName.startsWith('factory/stars142fm3lhv2x9ymvv8ze2udefec4wpf0czv4dsgjn0vmccmdt09tcqzt2ghk/')) {
        tokenName = 'bglSTARS';
      }
      tokenBalances[tokenName] = balance.amount;
    });

    return tokenBalances;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const queryBorrowedAmount = async (market: string) => {
  const data = await queryBalances();
  return data.regular.borrowed.amount;
};

const queryBglToStars = async (market: string)  => {
  const query = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryBglCurrencyToMainCurrencyPrice;

  const data = await query(market);
  return data;
};

const queryBgl_supply = async () => {
  const data = await queryBalances();
  return data.regular.bgl_supply;
};

// КВЕРЬ КОЛЛЕКЦИЙ //

const QueryCollectionList = async () => {
  const cwQueryStakers = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCollection;

  const data = await cwQueryStakers("main", "stars1w4rk4zpme2axwr2r6g8qgptcvpgktmyt2mh94vtyum8yt25guvdqw6rwad");
  return data;
};

const QueryCollection = async (address: string) => {
  const cwQueryCollection = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCollection;

  const data = await cwQueryCollection("main", address);
  return data;
};

const QueryOperators = async () => {
  const cwQueryOperators = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).utils.cwQueryOperators;

  const data = await cwQueryOperators(
    "kujira1hvp3q00ypzrurd46h7c7c3hu86tx9uf84up6a2",
    "kujira1yp4vwjypr0zdcanltz0kgvt05kx3gvlzllge6rhffdn2j49rcauqw8u50c",
  );
  return data;
};

const QueryBalanceInNft = async (owner: string, collectionAddress: string) => {
  const cwQueryBalanceInNft = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).utils.cwQueryBalanceInNft;

  const data = await cwQueryBalanceInNft(owner, collectionAddress);
  console.log(data)
  return data;
};

const fetchNftMetadata = async (
  contractAddress: string,
  tokenId: string,
): Promise<Metadata> => {
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.utils.cosmwasmQueryClient;
  const metadata = await client.queryContractSmart(contractAddress, {
    all_nft_info: {
      token_id: tokenId,
    },
  });
  console.log("Metadata response:", metadata);
  return metadata;
};

export const queryNftByAddress = async (
  contractAddress: string,
  userAddress: string,
): Promise<LendingPlatformTypes.CollectionInfoForString[]> => {
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.utils.cosmwasmQueryClient;
  try {
    const nfts = await client.queryContractSmart(contractAddress, {
      all_nft_info: {
        owner: userAddress,
      },
    });
    console.log("nft to deposit", nfts);
    return nfts.map((nft) => ({
      collection_address: contractAddress,
      token_id_list: [nft.token_id],
    }));
  } catch (error) {
    console.error("Error querying NFTs by address:", error);
    return [];
  }
};

const QueryBorrower = async (address: string, market: string) => {
  const cwQueryBorrower = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryBorrower;

  const data = await cwQueryBorrower(market, address);
  console.log(data)
  return data;
};





const QueryCollateral = async (market: string, collectionAddress: string) => {
  const cwQueryCollateral = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCollateral;

  const data = await cwQueryCollateral(market, collectionAddress);
  console.log(data)
  return data;
};

// КВЕРЬ Пропоузалов и конфигов //

const QueryProposals = async () => {
  const cwQueryProposals = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCollection;

  const data = await cwQueryProposals("main", "stars1w4rk4zpme2axwr2r6g8qgptcvpgktmyt2mh94vtyum8yt25guvdqw6rwad");
  return data;
};

const QueryConfig = async (market: string) => {
  const cwQueryCommonConfig = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryCommonConfig;

  const data = await cwQueryCommonConfig(market);
  return data;
};

const QueryConfig2 = async (market: string) => {
  const cwQueryCommonConfig = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.pQueryCollectionList;

  const data = await cwQueryCommonConfig("main", 100, 100);
  return data;
};



// КВЕРИ ДЛЯ ЛИКВИДАЦИЙ

export const queryAllBidsByAddress = async (
  address: string,
  contractAddress: string,
) => {
  const queryBidsMsg: LendingPlatformTypes.QueryMsg = {
    query_liquidation_bids_by_liquidator_address: { address },
  };
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.utils.cosmwasmQueryClient;
  try {
    const bids = await client.queryContractSmart(contractAddress, queryBidsMsg);
    console.log("All Bids:", bids);
    return bids;
  } catch (error) {
    console.error("Error querying all bids by address:", error);
    return [];
  }
};

export const queryLiquidationBidsByCollectionAddressList = async (market: string, address: string) => {
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.lending;
  try {
    const liquidationList =
      await client.cwQueryLiquidationBidsByCollectionAddress(market, address);
    return liquidationList;
  } catch (error) {
    console.error(
      "Error querying liquidation bids by collection address list:",
      error,
    );
    return [];
  }
};

export const queryLiquidationBidsByLiquidatorAddress = async (market: string, address: string) => {
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.lending;
  try {
    const liquidationList =
      await client.cwQueryLiquidationBidsByLiquidatorAddress(market, address);
    console.log("Liquidation List:", liquidationList, market, address);
    return liquidationList;
  } catch (error) {
    console.error(
      "Error querying liquidation bids by collection address list:",
      error,
    );
    return [];
  }
};

export const queryCollectionsList = async () => {
  const helpers = await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0]);
  const client = helpers.lending;
  try {
    const liquidationList =
      await client.cwQueryCollectionList("main");
    return liquidationList;
  } catch (error) {
    console.error(
      "Error querying liquidation bids by collection address list:",
      error,
    );
    return [];
  }
};

const QueryLiquidator = async (address: string) => {
  const cwQueryLiquidator = (
    await stargazeCwHelpers.getCwQueryHelpers(CHAIN, RPC[0])
  ).lending.cwQueryLiquidator;

  const data = await cwQueryLiquidator("main", address);
  return data;
};



export const liquidate = async (
  targets: LendingPlatformTypes.LiquidationItem[],
  gasPrice: string,
  owner: string,
  signer: any,
) => {
  const helpers = await stargazeCwHelpers.getCwExecHelpers(
    CHAIN,
    RPC[0],
    owner,
    signer,
  );
  const liquidate = helpers.lending.cwLiquidate;
  try {
    const result = await liquidate("main", targets, gasPrice);
    console.log("Liquidation result:", result);
    return result;
  } catch (error) {
    console.error("Error during liquidation:", error);
    return [];
  }
};

const queryCollectionPrice = (
  await stargazeCwHelpers.getCwQueryHelpers(
    CHAIN,
    RPC[0],
  )
).oracle.cwQueryPrices;

// КВЕРЬ Пропоузалов и конфигов //

export {
  queryCollectionPrice,
  queryBalances,
  queryDeposited,
  queryUnbonded,
  queryBorrowedAmount,
  QueryCollectionList,
  QueryCollection,
  QueryOperators,
  QueryProposals,
  QueryConfig,
  QueryBalanceInNft,
  queryBgl_supply,
  QueryBorrower,
  fetchNftMetadata,
  QueryLiquidator,
  QueryCollateral,
  queryUnbondedByAddress,
  QueryConditionalDepositApr,
  QueryCollateralByOwner,
  queryBalancesByOwner,
  queryBglToStars,
  queryUserInfo,
  queryUserInfoAfterAction
};
