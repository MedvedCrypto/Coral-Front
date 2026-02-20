import * as CwHelpers from "../../common/account/cw-helpers";
import { OfferCreateInfo, OfferUpdateInfo } from "../../common/codegen/Offer.types.js";
import { Offer } from "../../common/interfaces/index.js";
import { getSigner, detectWallet } from "../../js/wallet.js";

// const CHAIN = "harpoon-4";
const CHAIN = "dev-1"
// const denom = 1_000_000
const denom = 1_000_000

let RPC = "https://thornode-devnet-rpc.bryanlabs.net:443";

async function getWallet() {
  try {
    const wallet = await detectWallet("dev-1");
    if (wallet) {
      const { signer, owner } = await getSigner("dev-1", wallet);
      return { signer, owner };
    }
  } catch (error) {
    console.log(error);
  }
}

// const token = {
//       "native": {
//           "denom": "factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk"
//       }
// }


// const token = {
//   "cw20": {
//     "address": "sthor1pndh3u4jl95zppjdf58lk9g5ychszefrt0js9mxlmup06s3w7u0scfz4gw"
//   }
// };

const token = {
  cw20: {
    address: "sthor1pndh3u4jl95zppjdf58lk9g5ychszefrt0js9mxlmup06s3w7u0scfz4gw"
  }
}



const queryAllOffers = async () => {
  const cwQueryHelpers = await CwHelpers.getCwQueryHelpers(CHAIN, RPC);
  const cwQueryOffersCount = cwQueryHelpers.offer.cwQueryOffersCount;
  const cwQueryOffer = cwQueryHelpers.offer.cwQueryOffer;

  try {
      const number = await cwQueryOffersCount(); // Получаем число
      console.log("Полученное число:", number);

      // Создаем массив промисов от 1 до number
      const promises = Array.from({ length: number }, (_, index) => {
          return cwQueryOffer(index + 1); // Вызываем cwQueryOffer для каждого индекса от 1 до number
      });

      // Ждем выполнения всех промисов
      const results = await Promise.all(promises);
      console.log(results)
      return results; // Возвращаем массив результатов
    } catch (error) {
        console.log("Ошибка при выполнении запроса:", error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
};



// queryAllOffers()
// queryAllOffers2()


const queryMyOffers = async (owner: string, limit: number = 10) => {
  const cwQueryHelpers = await CwHelpers.getCwQueryHelpers(CHAIN, RPC);
  const cwQueryOffersByOwner = cwQueryHelpers.offer.cwQueryOffersByOwner

  try {
      const offers = await cwQueryOffersByOwner(owner, limit); 
      return offers; 
    } catch (error) {
        console.log("Ошибка при выполнении запроса:", error);
        return []; 
    }
};

const queryMyTrades = async (owner: string, limit: number = 10, last: number) => {
  const cwQueryHelpers = await CwHelpers.getCwQueryHelpers(CHAIN, RPC);
  const cwQueryOffersByOwner = cwQueryHelpers.trade.cwQueryTrades

  try {
      const offers = await cwQueryOffersByOwner(owner, limit, last); 
      return offers; 
    } catch (error) {
        console.log("Ошибка при выполнении запроса:", error);
        return []; 
    }
};

const querуTrade = async (id: number) => {
  const cwQueryHelpers = await CwHelpers.getCwQueryHelpers(CHAIN, RPC);
  const cwQueryOffersByOwner = cwQueryHelpers.trade.cwQueryTrade

  // const conf = cwQueryHelpers.hub.cwQueryConfig
  // console.log(await conf())

  try {
      const offers = await cwQueryOffersByOwner(id); 
      return offers; 
    } catch (error) {
        console.log("Ошибка при выполнении запроса:", error);
        return []; 
    }
};

const querуBlockTime = async () => {
  const cwQueryHelpers = await CwHelpers.getCwQueryHelpers(CHAIN, RPC);
  const cwQueryBlockTime = cwQueryHelpers.hub.cwQueryBlockTime

  const conf = cwQueryHelpers.hub.cwQueryConfig
  console.log(await conf())

  try {
      const time = await cwQueryBlockTime(); 
      return time; 
    } catch (error) {
        console.log("Ошибка при выполнении запроса:", error);
        return []; 
    }
};


const queryAllUserTrades = async (owner: string, limit: number = 10) => {
  let allTrades: any[] = [];
  let lastTradeId = undefined;

  while (true) {
    const offers = await queryMyTrades(owner, limit, lastTradeId);

    console.log(offers)
    
    if (offers.length === 0) {
      break; // Если офферов больше нет, выходим из цикла
    }

    // Обновляем lastOfferId на ID последнего оффера
    lastTradeId = offers[offers.length - 1].trade.id ;
    console.log(lastTradeId)

    // Получаем профили для каждого оффера и добавляем их в общий массив
    const offersWithProfiles = await Promise.all(offers.map(async (offer) => {
      return {
        offer: offer,
      };
    }));

    allTrades = allTrades.concat(offersWithProfiles);

    // break
  }

  return allTrades;
};

const getAllOffers = async (owner, limit = 10) => {
  let allOffers = [];
  let lastOfferId = undefined;

  while (true) {
    const offers = await queryMyOffers(owner, limit, lastOfferId);
    
    if (offers.length === 0) {
      break; // Если офферов больше нет, выходим из цикла
    }

    // Обновляем lastOfferId на ID последнего оффера
    lastOfferId = offers[offers.length - 1].id;

    // Получаем профили для каждого оффера и добавляем их в общий массив
    const offersWithProfiles = await Promise.all(offers.map(async (offer) => {
      return {
        offer: offer,
      };
    }));

    allOffers = allOffers.concat(offersWithProfiles);
  }

  return allOffers;
};







const btnPauseOrArchiveOffer = async (offerUpdateInfo: OfferUpdateInfo) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateOffer = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).offer.cwUpdateOffer;


    console.log(offerUpdateInfo, owner, RPC, signer)

    try {
      const { transactionHash } = await cwCreateOffer(offerUpdateInfo, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnUpdateOffer = async (offerUpdateInfo: OfferUpdateInfo) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateOffer = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).offer.cwUpdateOffer;


    console.log(offerUpdateInfo)

    try {
      const { transactionHash } = await cwCreateOffer(offerUpdateInfo, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnCreateOffer = async (offerData: OfferCreateInfo) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateOffer = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).offer.cwCreateOffer;


    console.log(offerData, owner, RPC, signer)
    
      try {
        const { transactionHash } = await cwCreateOffer(offerData, "0.01rune");
        return(transactionHash);
      } catch (error) {
        return({e: String(error)});
      }
    
  }
};

const btnAddArb = async () => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateArbitrator = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwCreateArbitrator;


    const { transactionHash } = await cwCreateArbitrator("e_u_r", "kujira1hvp3q00ypzrurd46h7c7c3hu86tx9uf84up6a2", "123", "0.01rune");
    if (transactionHash) {
      try {
        return transactionHash;
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const btnTradeOffer = async (offerId:number, amount:number, contact:string, address:string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateTrade = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwCreateTrade;



    try {
      const { transactionHash } = await cwCreateTrade(amount, offerId, address, "0.01rune");
      return(transactionHash);
    } catch (error) {
      if (String(error).includes('outside of offer')) {
        return { e: "Please enter the quantity, within the limit of this offer" };
      } else {
        return { e: String(error) };
      }
    }
  }
};

const btnCancelTradeRequest = async (tradeId: number) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCancelRequest = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwCancelRequest;



    try {
      const { transactionHash } = await cwCancelRequest(tradeId, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnAcceptTradeRequest = async (tradeId: number, makerContact: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwAcceptRequest = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwAcceptRequest;
    try {
      const { transactionHash } = await cwAcceptRequest(tradeId, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnTradeFundEscrow = async (amount: number, tradeId: number, makerContact: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwFundEscrow = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwFundEscrow;


    console.log(amount, token, tradeId, "0.01rune")

    try {
      const { transactionHash } = await cwFundEscrow(amount, token, tradeId, "0.01rune");
      return(transactionHash);
    } catch (error) {
      console.log(error)
      return({e: String(error)});
    }
  }
};

const btnTradeSetDepositedFiat = async (tradeId: number) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwSetFiatDepositedState = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwSetFiatDepositedState;



    try {
      const { transactionHash } = await cwSetFiatDepositedState(tradeId, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnTradeReleaseEscrow= async (tradeId: number) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwReleaseEscrow = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).trade.cwReleaseEscrow;



    try {
      const { transactionHash } = await cwReleaseEscrow(tradeId, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};



const btnGenerate = async () => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwCreateEncKey = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwCreateEncKey;

    try {
      const transactionHash = await cwCreateEncKey("0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnSendMsg = async (key:string, receiver:string, msg:string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwSendMessage = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwSendMessage;

    try {
      const transactionHash = await cwSendMessage(key, receiver,msg, "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnAllowToRead = async () => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwAllowToReadChat = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwAllowToReadChat;

    try {
      const transactionHash = await cwAllowToReadChat("d60f0268134dc1746d99e3fbff8faa88e530ca3fdeb9d3608295d91013281af1","kujira1hvp3q00ypzrurd46h7c7c3hu86tx9uf84up6a2","kujira133xakkrfksq39wxy575unve2nyehg5npnflfk6", "0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};


const btnRemoveBindingHash = async (bindingHash: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwRemoveBindingHash = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwRemoveBindingHash;

    try {
      const transactionHash = await cwRemoveBindingHash(bindingHash,"0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const btnUploadImage = async (key: string, image: any, id: any) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwStoreImage = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwStoreImage;

    try {
      console.log(key, image, id);
      
      // Условно передаем либо id, либо пустой объект
      const transactionHash = await cwStoreImage(key, image, ({}), "0.01rune");
      return transactionHash;
    } catch (error) {
      return { e: String(error) };
    }
  }
};


const btnAllowToReadImages = async (key: string, idList: number[], wlAddress:string[]) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwAllowToReadImages = (
      await CwHelpers.getCwExecHelpers(CHAIN, RPC, owner, signer)
    ).chat.cwAllowToReadImages;

    try {
      console.log(key, idList, wlAddress)
      const transactionHash = await cwAllowToReadImages(key, idList, wlAddress,"0.01rune");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const queryLastImageId = async (key: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwQueryLastImageId = (
      await CwHelpers.getCwQueryHelpers(CHAIN, RPC)
    ).chat.cwQueryLastImageId;

    try {
      const transactionHash = await cwQueryLastImageId(key,owner);
      console.log(transactionHash)
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const queryImage = async (key: string, imageId:number, owner: string, receiver: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const cwQueryImage = (
      await CwHelpers.getCwQueryHelpers(CHAIN, RPC)
    ).chat.cwQueryImage;

    try {
      const transactionHash = await cwQueryImage(key, imageId,owner,receiver);
      console.log(transactionHash)
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};

const queryChat = async (receiver: string, key: string) => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwAllowToReadChat = (
      await CwHelpers.getCwQueryHelpers(CHAIN, RPC)
    ).chat.cwQueryChat;

    try {
      console.log(key,receiver,owner,owner)
      const transactionHash = await cwAllowToReadChat(key,owner,receiver,owner,owner);
      console.log(transactionHash)
      return(transactionHash);
    } catch (error) {
      console.log({e: String(error)})
      return([])
    }
  }
};

const queryEncKey = async () => {
  const wallet = await getWallet();
  if (wallet) {
    const { owner, signer } = wallet;
    const cwAllowToReadChat = (
      await CwHelpers.getCwQueryHelpers(CHAIN, RPC)
    ).chat.cwQueryEncKey;

    try {
      const transactionHash = await cwAllowToReadChat("17402278009031970880.5879053714094991kujira1hvp3q00ypzrurd46h7c7c3hu86tx9uf84up6a2");
      return(transactionHash);
    } catch (error) {
      return({e: String(error)});
    }
  }
};






export {queryImage, queryLastImageId, btnAllowToReadImages, btnUploadImage,btnRemoveBindingHash, queryEncKey, queryChat, btnAllowToRead, btnSendMsg, btnGenerate, querуBlockTime, btnTradeReleaseEscrow, btnTradeSetDepositedFiat, btnTradeFundEscrow, querуTrade, btnAcceptTradeRequest, btnCreateOffer, btnTradeOffer, btnAddArb, queryAllOffers, queryMyOffers, getAllOffers,btnPauseOrArchiveOffer, btnUpdateOffer, queryAllUserTrades, btnCancelTradeRequest };
