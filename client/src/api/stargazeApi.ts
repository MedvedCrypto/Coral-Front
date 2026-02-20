import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
const rpcEndpoint:string = "https://stargaze-rpc.polkachu.com/";

export interface Bid {
  price: string;
  expires_at: string;
}

export interface BidsResponse {
  bids: Bid[];
}

export function getValidBidAmounts(bids: { bids: Bid[] }): string[] {
  const currentTimestampMs = Date.now();
  const validBids = bids.filter((bid) => {
    const expiresAtMs = parseInt(bid.expires_at, 10) / 1000000; // Преобразуем микросекунды в миллисекунды
    return expiresAtMs > currentTimestampMs; // Сравниваем с текущим временем в секундах
  });

  validBids.sort((a, b) => {
    const aPriceNum = parseFloat(a.price);
    const bPriceNum = parseFloat(b.price);
    return bPriceNum - aPriceNum;
  });

  return validBids.map((bid) => bid.price);
}

export const queryOffers = async (collection: string): Promise<any> => {
  const client = await CosmWasmClient.connect(rpcEndpoint);
  try {
    const queryMsg = {
      collection_bids_sorted_by_price: {
        collection,
        limit: 150,
      },
    };
    const response = await client.queryContractSmart(
      "stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl",
      queryMsg
    );
    return(response)
  } catch (error) {
    console.error("Query error:", error);

  }

}


export function getPriceByAddress(addressFind: string | undefined, data: any[]) {
    const collection = data.find(item => item.address === addressFind);
  
    if (collection) {
      return {
        price: collection.price,
        usd_price: collection.usd_price,
      };
    } else {
      return null;
    }
  }
  
  export  async function createPriceObject(data: any[]) {
    const priceObject = {};
  
    for (const collection of data) {
      const { address } = collection;
      const priceData = getPriceByAddress(address, data);
      if (priceData) {
        priceObject[address] = {
          main: priceData.price.amount,
          stable: priceData.usd_price.amount,
        };
      }
    }
  
    return priceObject;
  }