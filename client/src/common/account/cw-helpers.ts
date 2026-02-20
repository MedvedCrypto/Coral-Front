import { HubMsgComposer } from "../codegen/Hub.message-composer";
import { HubQueryClient } from "../codegen/Hub.client";

import { OfferMsgComposer } from "../codegen/Offer.message-composer";
import { OfferQueryClient } from "../codegen/Offer.client";

import { ProfileQueryClient } from "../codegen/Profile.client";

import { TradeMsgComposer } from "../codegen/Trade.message-composer";
import { TradeQueryClient } from "../codegen/Trade.client";

import { HashGeneratorQueryClient } from "../codegen/HashGenerator.client";

import { ChatMsgComposer } from "../codegen/Chat.message-composer";
import { ChatQueryClient } from "../codegen/Chat.client";

import { JusticeMsgComposer } from "../codegen/Justice.message-composer";
import { JusticeQueryClient } from "../codegen/Justice.client";

import CONFIG_JSON from "../config/config.json";
import { l, logAndReturn } from "../utils";
import { toBase64, fromUtf8, fromBase64, toHex } from "@cosmjs/encoding";
import { getChainOptionById, getContractByLabel } from "../config/config-utils";
import { CurrencyForTokenUnverified, Fee, Range } from "../codegen/Hub.types";
import {
  getCwClient,
  signAndBroadcastWrapper,
  getExecuteContractMsg,
} from "./clients";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
  MsgExecuteContractEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineSigner,
  OfflineDirectSigner,
  coin,
} from "@cosmjs/proto-signing";
import {
  Cw20SendMsg,
  TokenUnverified,
  ChainConfig,
  ContractInfo,
  HashResponse,
  ChatItem,
  ChatText,
  CreateEncKeyResponse,
  ImageItem,
  GuestApproval,
  WhitelistInfo,
} from "../interfaces";
import {
  FiatCurrency,
  OfferCreateInfo,
  OfferOrder,
  OfferType,
  OfferUpdateInfo,
} from "../codegen/Offer.types";
import {
  addressToSalt,
  decryptDeserialize,
  generateBindingHashPassword,
  serializeEncrypt,
} from "./converters";

function addSingleTokenToComposerObj(
  obj: MsgExecuteContractEncodeObject,
  amount: number,
  token: TokenUnverified
): MsgExecuteContractEncodeObject {
  const {
    value: { contract, sender, msg },
  } = obj;

  if (!(contract && sender && msg)) {
    throw new Error(`${msg} parameters error!`);
  }

  return getSingleTokenExecMsg(
    contract,
    sender,
    JSON.parse(fromUtf8(msg)),
    amount,
    token
  );
}

function getSingleTokenExecMsg(
  contractAddress: string,
  senderAddress: string,
  msg: any,
  amount?: number,
  token?: TokenUnverified
) {
  // get msg without funds
  if (!(token && amount)) {
    return getExecuteContractMsg(contractAddress, senderAddress, msg, []);
  }

  // get msg with native token
  if ("native" in token) {
    return getExecuteContractMsg(contractAddress, senderAddress, msg, [
      coin(amount, token.native.denom),
    ]);
  }

  // get msg with CW20 token
  const cw20SendMsg: Cw20SendMsg = {
    send: {
      contract: contractAddress,
      amount: `${amount}`,
      msg: toBase64(msg),
    },
  };

  return getExecuteContractMsg(
    token.cw20.address,
    senderAddress,
    cw20SendMsg,
    []
  );
}

function getContracts(contracts: ContractInfo[]) {
  let HUB_CONTRACT: ContractInfo | undefined;
  let OFFER_CONTRACT: ContractInfo | undefined;
  let PROFILE_CONTRACT: ContractInfo | undefined;
  let TRADE_CONTRACT: ContractInfo | undefined;
  let HASH_GENERATOR_CONTRACT: ContractInfo | undefined;
  let CHAT_CONTRACT: ContractInfo | undefined;
  let JUSTICE_CONTRACT: ContractInfo | undefined;

  try {
    HUB_CONTRACT = getContractByLabel(contracts, "hub");
  } catch (error) {
    l(error);
  }

  try {
    OFFER_CONTRACT = getContractByLabel(contracts, "offer");
  } catch (error) {
    l(error);
  }

  try {
    PROFILE_CONTRACT = getContractByLabel(contracts, "profile");
  } catch (error) {
    l(error);
  }

  try {
    TRADE_CONTRACT = getContractByLabel(contracts, "trade");
  } catch (error) {
    l(error);
  }

  try {
    HASH_GENERATOR_CONTRACT = getContractByLabel(contracts, "hash_generator");
  } catch (error) {
    l(error);
  }

  try {
    CHAT_CONTRACT = getContractByLabel(contracts, "chat");
  } catch (error) {
    l(error);
  }

  try {
    JUSTICE_CONTRACT = getContractByLabel(contracts, "justice");
  } catch (error) {
    l(error);
  }

  return {
    HUB_CONTRACT,
    OFFER_CONTRACT,
    PROFILE_CONTRACT,
    TRADE_CONTRACT,
    HASH_GENERATOR_CONTRACT,
    CHAT_CONTRACT,
    JUSTICE_CONTRACT,
  };
}

async function getCwExecHelpers(
  chainId: string,
  rpc: string,
  owner: string,
  signer: (OfflineSigner & OfflineDirectSigner) | DirectSecp256k1HdWallet
) {
  const CHAIN_CONFIG = CONFIG_JSON as ChainConfig;
  const {
    OPTION: { CONTRACTS },
  } = getChainOptionById(CHAIN_CONFIG, chainId);

  const {
    HUB_CONTRACT,
    OFFER_CONTRACT,
    TRADE_CONTRACT,
    HASH_GENERATOR_CONTRACT,
    CHAT_CONTRACT,
    JUSTICE_CONTRACT,
  } = getContracts(CONTRACTS);

  const cwClient = await getCwClient(rpc, owner, signer);
  if (!cwClient) throw new Error("cwClient is not found!");

  const signingClient = cwClient.client as SigningCosmWasmClient;
  const _signAndBroadcast = signAndBroadcastWrapper(signingClient, owner);

  const hubMsgComposer = new HubMsgComposer(owner, HUB_CONTRACT?.ADDRESS || "");

  const offerMsgComposer = new OfferMsgComposer(
    owner,
    OFFER_CONTRACT?.ADDRESS || ""
  );

  const tradeMsgComposer = new TradeMsgComposer(
    owner,
    TRADE_CONTRACT?.ADDRESS || ""
  );

  const chatMsgComposer = new ChatMsgComposer(
    owner,
    CHAT_CONTRACT?.ADDRESS || ""
  );

  const justiceMsgComposer = new JusticeMsgComposer(
    owner,
    JUSTICE_CONTRACT?.ADDRESS || ""
  );

  async function _msgWrapperWithGasPrice(
    msgs: MsgExecuteContractEncodeObject[],
    gasPrice: string,
    gasAdjustment: number = 1,
    memo?: string
  ) {
    const tx = await _signAndBroadcast(msgs, gasPrice, gasAdjustment, memo);
    l("\n", tx, "\n");
    return tx;
  }

  // queries

  const queryTimestamp = async (): Promise<string> => {
    return await signingClient.queryContractSmart(
      HASH_GENERATOR_CONTRACT?.ADDRESS || "",
      {
        timestamp: {},
      }
    );
  };

  const queryHashReproduceable = async (
    userPassword: string,
    userSalt: string
  ): Promise<string> => {
    const res = (await signingClient.queryContractSmart(
      HASH_GENERATOR_CONTRACT?.ADDRESS || "",
      {
        hash_reproduceable: {
          user_password: userPassword,
          user_salt: userSalt,
        },
      }
    )) as unknown as HashResponse;

    return toHex(res.bytes);
  };

  const queryEncKey = async (bindingHashPassword: string): Promise<string> => {
    const res = (await signingClient.queryContractSmart(
      CHAT_CONTRACT?.ADDRESS || "",
      {
        enc_key: {
          binding_hash_password: bindingHashPassword,
        },
      }
    )) as unknown as HashResponse;

    return toHex(res.bytes);
  };

  // hub

  async function cwUpdateAddressConfig(
    {
      admin,
      offer,
      trade,
      profile,
      hashGenerator,
      chat,
      justice,
      treasury,
      judgeList,
    }: {
      admin?: string;
      offer?: string;
      trade?: string;
      profile?: string;
      hashGenerator?: string;
      chat?: string;
      justice?: string;
      treasury?: string;
      judgeList?: string[];
    },
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        hubMsgComposer.updateAddressConfig({
          admin,
          offer,
          trade,
          profile,
          hashGenerator,
          chat,
          justice,
          treasury,
          judgeList,
        }),
      ],
      gasPrice
    );
  }

  async function cwUpdateCommonConfig(
    {
      tradeExpirationTimer,
      tradeDisputeTimer,
      joinDisputeTimer,
      activeOffersLimit,
      activeTradesLimit,
      stablecoin,
      tradeFee,
      disputeFee,
      tradeLimit,
      chatMaxLength,
      chatMaxSymbolsPerMsg,
      chatMaxMsgSequence,
      disputeQuorum,
    }: {
      tradeExpirationTimer?: number;
      tradeDisputeTimer?: number;
      joinDisputeTimer?: number;
      activeOffersLimit?: number;
      activeTradesLimit?: number;
      stablecoin?: CurrencyForTokenUnverified;
      tradeFee?: Fee;
      disputeFee?: Fee;
      tradeLimit?: Range;
      chatMaxLength?: number;
      chatMaxSymbolsPerMsg?: number;
      chatMaxMsgSequence?: number;
      disputeQuorum?: number;
    },
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        hubMsgComposer.updateCommonConfig({
          tradeExpirationTimer,
          tradeDisputeTimer,
          joinDisputeTimer,
          activeOffersLimit,
          activeTradesLimit,
          stablecoin,
          tradeFee,
          disputeFee,
          tradeLimit,
          chatMaxLength,
          chatMaxSymbolsPerMsg,
          chatMaxMsgSequence,
          disputeQuorum,
        }),
      ],

      gasPrice
    );
  }

  async function cwAcceptAdminRole(gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [hubMsgComposer.acceptAdminRole()],
      gasPrice
    );
  }

  async function cwPause(gasPrice: string) {
    return await _msgWrapperWithGasPrice([hubMsgComposer.pause()], gasPrice);
  }

  async function cwUnpause(gasPrice: string) {
    return await _msgWrapperWithGasPrice([hubMsgComposer.unpause()], gasPrice);
  }

  // offer

  async function cwOfferRegisterHub(gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [offerMsgComposer.registerHub()],
      gasPrice
    );
  }

  async function cwCreateOffer(offer: OfferCreateInfo, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [offerMsgComposer.createOffer(offer as any)],
      gasPrice
    );
  }

  async function cwUpdateOffer(offer: OfferUpdateInfo, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [offerMsgComposer.updateOffer(offer as any)],
      gasPrice
    );
  }

  // trade

  async function cwTradeRegisterHub(gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.registerHub()],
      gasPrice
    );
  }

  async function cwCreateTrade(
    amount: number,
    offerId: number,
    taker: string,
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        tradeMsgComposer.createTrade({
          amount: amount.toString(),
          offerId,
          taker,
        }),
      ],

      gasPrice
    );
  }

  async function cwAcceptRequest(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.acceptRequest({ tradeId })],
      gasPrice
    );
  }

  async function cwFundEscrow(
    amount: number,
    token: TokenUnverified,
    tradeId: number,
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        addSingleTokenToComposerObj(
          tradeMsgComposer.fundEscrow({ tradeId }),
          amount,
          token
        ),
      ],

      gasPrice
    );
  }

  async function cwReleaseEscrow(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.releaseEscrow({ tradeId })],
      gasPrice
    );
  }

  async function cwSetFiatDepositedState(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.setFiatDepositedState({ tradeId })],
      gasPrice
    );
  }

  async function cwCancelRequest(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.cancelRequest({ tradeId })],
      gasPrice
    );
  }

  async function cwRefundEscrow(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.refundEscrow({ tradeId })],
      gasPrice
    );
  }

  async function cwRequestDispute(
    amount: number,
    token: TokenUnverified,
    tradeId: number,
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        addSingleTokenToComposerObj(
          tradeMsgComposer.requestDispute({
            tradeId,
          }),
          amount,
          token
        ),
      ],
      gasPrice
    );
  }

  async function cwJoinDispute(
    amount: number,
    token: TokenUnverified,
    tradeId: number,
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        addSingleTokenToComposerObj(
          tradeMsgComposer.joinDispute({
            tradeId,
          }),
          amount,
          token
        ),
      ],
      gasPrice
    );
  }

  async function cwFinalizeDispute(tradeId: number, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [tradeMsgComposer.finalizeDispute({ tradeId })],
      gasPrice
    );
  }

  // chat

  async function cwCreateEncKey(
    gasPrice: string
  ): Promise<CreateEncKeyResponse> {
    const timestamp = await queryTimestamp();
    const bindingHashPassword = generateBindingHashPassword(timestamp, owner);
    const bindingHashSalt = addressToSalt(CHAT_CONTRACT?.ADDRESS || "");
    const bindingHash = await queryHashReproduceable(
      bindingHashPassword,
      bindingHashSalt
    );

    await _msgWrapperWithGasPrice(
      [
        chatMsgComposer.prepareEncKey({
          bindingHash,
        }),
      ],
      gasPrice
    );

    const encKey = await queryEncKey(bindingHashPassword);

    return {
      encKey,
      bindingHash,
    };
  }

  async function cwRemoveBindingHash(bindingHash: string, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [
        chatMsgComposer.removeBindingHash({
          bindingHash,
        }),
      ],
      gasPrice
    );
  }

  async function cwRemoveBindingHashUnstable(gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [chatMsgComposer.removeBindingHashUnstable()],
      gasPrice
    );
  }

  async function cwSendMessage(
    encKey: string,
    recipient: string,
    message: string,
    gasPrice: string
  ) {
    const text: ChatText = { recipient, data: message };
    const timestamp = await queryTimestamp();
    const { value } = serializeEncrypt(encKey, timestamp, text);

    return await _msgWrapperWithGasPrice(
      [chatMsgComposer.sendMessage({ data: value, timestamp })],
      gasPrice
    );
  }

  async function cwStoreImage(
    encKey: string,
    image: Uint8Array,
    {
      id,
    }: {
      id?: number;
    },
    gasPrice: string
  ) {
    const imageItem: ImageItem = { id, image: toBase64(image) };
    const timestamp = await queryTimestamp();
    const { value } = serializeEncrypt(encKey, timestamp, imageItem);

    return await _msgWrapperWithGasPrice(
      [chatMsgComposer.storeImage({ data: value, timestamp })],
      gasPrice
    );
  }

  async function cwAllowToReadChat(
    encKey: string,
    counterparty: string,
    guestList: string[],
    gasPrice: string
  ) {
    const data: GuestApproval = { counterparty, guest_list_to_add: guestList };
    const timestamp = await queryTimestamp();
    const { value } = serializeEncrypt(encKey, timestamp, data);

    return await _msgWrapperWithGasPrice(
      [chatMsgComposer.allowToReadChat({ data: value, timestamp })],
      gasPrice
    );
  }

  async function cwAllowToReadImages(
    encKey: string,
    id_list: number[],
    whitelist: string[],
    gasPrice: string
  ) {
    const data: WhitelistInfo = { id_list, whitelist };
    const timestamp = await queryTimestamp();
    const { value } = serializeEncrypt(encKey, timestamp, data);

    return await _msgWrapperWithGasPrice(
      [chatMsgComposer.allowToReadImages({ data: value, timestamp })],
      gasPrice
    );
  }

  // justice

  async function cwVote(tradeId: number, winner: string, gasPrice: string) {
    return await _msgWrapperWithGasPrice(
      [
        justiceMsgComposer.vote({
          tradeId,
          winner,
        }),
      ],
      gasPrice
    );
  }

  async function cwClaim(
    { recipient }: { recipient?: string },
    gasPrice: string
  ) {
    return await _msgWrapperWithGasPrice(
      [
        justiceMsgComposer.claim({
          recipient,
        }),
      ],
      gasPrice
    );
  }

  return {
    hub: {
      cwUpdateAddressConfig,
      cwUpdateCommonConfig,
      cwAcceptAdminRole,
      cwPause,
      cwUnpause,
    },
    offer: { cwRegisterHub: cwOfferRegisterHub, cwCreateOffer, cwUpdateOffer },
    trade: {
      cwRegisterHub: cwTradeRegisterHub,
      cwCreateTrade,
      cwAcceptRequest,
      cwFundEscrow,
      cwReleaseEscrow,
      cwSetFiatDepositedState,
      cwCancelRequest,
      cwRefundEscrow,
    },
    chat: {
      cwCreateEncKey,
      cwRemoveBindingHash,
      cwRemoveBindingHashUnstable,
      cwSendMessage,
      cwStoreImage,
      cwAllowToReadChat,
      cwAllowToReadImages,
    },
    justice: {
      cwVote,
      cwClaim,
    },
  };
}

async function getCwQueryHelpers(chainId: string, rpc: string) {
  const CHAIN_CONFIG = CONFIG_JSON as ChainConfig;
  const {
    OPTION: { CONTRACTS },
  } = getChainOptionById(CHAIN_CONFIG, chainId);

  const {
    HUB_CONTRACT,
    OFFER_CONTRACT,
    PROFILE_CONTRACT,
    TRADE_CONTRACT,
    HASH_GENERATOR_CONTRACT,
    CHAT_CONTRACT,
    JUSTICE_CONTRACT,
  } = getContracts(CONTRACTS);

  const cwClient = await getCwClient(rpc);
  if (!cwClient) throw new Error("cwClient is not found!");

  const cosmwasmQueryClient: CosmWasmClient = cwClient.client;

  const hubQueryClient = new HubQueryClient(
    cosmwasmQueryClient,
    HUB_CONTRACT?.ADDRESS || ""
  );

  const offerQueryClient = new OfferQueryClient(
    cosmwasmQueryClient,
    OFFER_CONTRACT?.ADDRESS || ""
  );

  const profileQueryClient = new ProfileQueryClient(
    cosmwasmQueryClient,
    PROFILE_CONTRACT?.ADDRESS || ""
  );

  const tradeQueryClient = new TradeQueryClient(
    cosmwasmQueryClient,
    TRADE_CONTRACT?.ADDRESS || ""
  );

  const hashGeneratorQueryClient = new HashGeneratorQueryClient(
    cosmwasmQueryClient,
    HASH_GENERATOR_CONTRACT?.ADDRESS || ""
  );

  const chatQueryClient = new ChatQueryClient(
    cosmwasmQueryClient,
    CHAT_CONTRACT?.ADDRESS || ""
  );

  const justiceQueryClient = new JusticeQueryClient(
    cosmwasmQueryClient,
    JUSTICE_CONTRACT?.ADDRESS || ""
  );

  // hub

  async function cwQueryAddressConfig(isDisplayed: boolean = false) {
    const res = await hubQueryClient.addressConfig();
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryCommonConfig(isDisplayed: boolean = false) {
    const res = await hubQueryClient.commonConfig();
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryBlockTime(isDisplayed: boolean = false) {
    const res = await hubQueryClient.blockTime();
    return logAndReturn(res, isDisplayed);
  }

  // offer

  async function cwQueryOffersCount(isDisplayed: boolean = false) {
    const res = await offerQueryClient.offersCount();
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryOffer(id: number, isDisplayed: boolean = false) {
    const res = await offerQueryClient.offer({ id });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryOfferBy(
    offerType: OfferType,
    fiatCurrency: FiatCurrency,
    order: OfferOrder,
    limit: number,
    last: number | undefined = undefined,
    isDisplayed: boolean = false
  ) {
    const res = await offerQueryClient.offersBy({
      offerType,
      fiatCurrency,
      order,
      limit,
      last,
    });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryOffersByOwner(
    owner: string,
    limit: number,
    last: number | undefined = undefined,
    isDisplayed: boolean = false
  ) {
    const res = await offerQueryClient.offersByOwner({ owner, limit, last });
    return logAndReturn(res, isDisplayed);
  }

  // profile

  async function cwQueryProfile(addr: string, isDisplayed: boolean = false) {
    const res = await profileQueryClient.profile({ addr });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryProfiles(
    limit: number,
    startAt: number | undefined = undefined,
    isDisplayed: boolean = false
  ) {
    const res = await profileQueryClient.profiles({ limit, startAt });
    return logAndReturn(res, isDisplayed);
  }

  // trade

  async function cwQueryTrade(id: number, isDisplayed: boolean = false) {
    const res = await tradeQueryClient.trade({ id });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryTrades(
    user: string,
    limit: number,
    last: number | undefined = undefined,
    isDisplayed: boolean = false
  ) {
    const res = await tradeQueryClient.trades({ user, limit, last });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryModelTrades(
    user: string,
    isDisplayed: boolean = false
  ) {
    const res = await tradeQueryClient.modelTrades({ user });
    return logAndReturn(res, isDisplayed);
  }

  // hash-generator

  async function cwQueryHashReproduceable(
    userPassword: string,
    userSalt: string,
    isDisplayed: boolean = false
  ) {
    const res = (await hashGeneratorQueryClient.hashReproduceable({
      userPassword,
      userSalt,
    })) as unknown as HashResponse;
    return logAndReturn(toHex(res.bytes), isDisplayed);
  }

  async function cwQueryHashUnique(
    userPassword: string,
    userSalt: string,
    isDisplayed: boolean = false
  ) {
    const res = (await hashGeneratorQueryClient.hashUnique({
      userPassword,
      userSalt,
    })) as unknown as HashResponse;
    return logAndReturn(toHex(res.bytes), isDisplayed);
  }

  async function cwQueryTimestamp(isDisplayed: boolean = false) {
    const res = await hashGeneratorQueryClient.timestamp();
    return logAndReturn(res, isDisplayed);
  }

  // chat

  async function cwQueryEncKey(
    bindingHashPassword: string,
    isDisplayed: boolean = false
  ) {
    const res = (await chatQueryClient.encKey({
      bindingHashPassword,
    })) as unknown as HashResponse;
    return logAndReturn(toHex(res.bytes), isDisplayed);
  }

  async function cwQueryChat(
    encKey: string,
    addressA: string,
    addressB: string,
    recipient: string,
    isDisplayed: boolean = false
  ) {
    const { value, timestamp } = await chatQueryClient.chat({
      addressA,
      addressB,
      recipient,
    });
    const res: ChatItem[] = decryptDeserialize(encKey, timestamp, value);
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryChatGuestList(
    encKey: string,
    addressA: string,
    addressB: string,
    recipient: string,
    isDisplayed: boolean = false
  ) {
    const { value, timestamp } = await chatQueryClient.chatGuestList({
      addressA,
      addressB,
      recipient,
    });
    const res: string[] = decryptDeserialize(encKey, timestamp, value);
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryImage(
    encKey: string,
    id: number,
    owner: string,
    recipient: string,
    isDisplayed: boolean = false
  ) {
    const { value, timestamp } = await chatQueryClient.image({
      id,
      owner,
      recipient,
    });
    const res: string = decryptDeserialize(encKey, timestamp, value);
    return logAndReturn(fromBase64(res), isDisplayed);
  }

  async function cwQueryImageWhitelist(
    encKey: string,
    id: number,
    owner: string,
    isDisplayed: boolean = false
  ) {
    const { value, timestamp } = await chatQueryClient.imageWhitelist({
      id,
      owner,
    });
    const res: string[] = decryptDeserialize(encKey, timestamp, value);
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryLastImageId(
    encKey: string,
    owner: string,
    isDisplayed: boolean = false
  ) {
    const { value, timestamp } = await chatQueryClient.lastImageId({ owner });
    const res: number = decryptDeserialize(encKey, timestamp, value);
    return logAndReturn(res, isDisplayed);
  }

  // justice

  async function cwQueryDispute(tradeId: number, isDisplayed: boolean = false) {
    const res = await justiceQueryClient.dispute({ tradeId });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryDisputeList(
    amount: number,
    startBefore: number | undefined = undefined,
    isDisplayed: boolean = false
  ) {
    const res = await justiceQueryClient.disputeList({ amount, startBefore });
    return logAndReturn(res, isDisplayed);
  }

  async function cwQueryFee(isDisplayed: boolean = false) {
    const res = await justiceQueryClient.fee();
    return logAndReturn(res, isDisplayed);
  }

  return {
    hub: {
      cwQueryAddressConfig,
      cwQueryCommonConfig,
      cwQueryBlockTime,
    },
    offer: {
      cwQueryOffersCount,
      cwQueryOffer,
      cwQueryOfferBy,
      cwQueryOffersByOwner,
    },
    profile: {
      cwQueryProfile,
      cwQueryProfiles,
    },
    trade: {
      cwQueryTrade,
      cwQueryTrades,
      cwQueryModelTrades,
    },
    hashGenerator: {
      cwQueryHashReproduceable,
      cwQueryHashUnique,
      cwQueryTimestamp,
    },
    chat: {
      cwQueryEncKey,
      cwQueryChat,
      cwQueryChatGuestList,
      cwQueryImage,
      cwQueryImageWhitelist,
      cwQueryLastImageId,
    },
    justice: {
      cwQueryDispute,
      cwQueryDisputeList,
      cwQueryFee,
    },
  };
}

export { getCwExecHelpers, getCwQueryHelpers };
