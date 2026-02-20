import React, { useCallback, useContext, useEffect, useState } from "react";
import TxHashContext from "./../context/txHash.tsx";
import sprite from "../../images/sprite.svg";
import {
  btnAcceptTradeRequest,
  btnCancelTradeRequest,
  btnTradeFundEscrow,
} from "../buttons/btnLend.ts";
import { queryAllUserTrades, querуBlockTime } from "../buttons/btnLend.ts";
// import { Link } from "react-router-dom";

const denom = 1_000_000

function timestampToDate(timestamp: number) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = date.toLocaleDateString("default", options);
  return formattedDate;
}

const offerIsActive = function (
  state_history: Array<StateEntry>,
  timeNow: number
): OfferIsActiveResult {
  if (!Array.isArray(state_history)) {
    console.log("state_history must be an array");
    return { el: <div>Time's up</div>, date: true }; // Возвращаем React-элемент
  } else {
    const escrowFundedEntry = state_history.find(
      (entry) => entry.state === "escrow_funded"
    );

    if (escrowFundedEntry && typeof escrowFundedEntry.timestamp === "number") {
      const now = timeNow; // Получаем текущее время
      const timeRemaining = escrowFundedEntry.timestamp + 21600 - now; // 21600 секунд = 6 часов
      console.log(timeRemaining);

      if (timeRemaining <= 0) {
        return { el: <div>Time's up</div>, date: false }; // Возвращаем React-элемент
      }

      const minutesRemaining = Math.floor((timeRemaining / 60) % 60); // Остаток минут
      const hoursRemaining = Math.floor(timeRemaining / 60 / 60); // Остаток часов

      // Форматируем вывод
      let formattedTime;
      if (hoursRemaining > 0) {
        formattedTime = `${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""} ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}`;
      } else {
        formattedTime = `${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}`;
      }

      return { el: <div>{formattedTime}</div>, date: true }; // Возвращаем React-элемент
    } else {
      return { el: <div>Time's up</div>, date: true }; // Возвращаем React-элемент
    }
  }
};

const capitalizedFirst = (str) => str?.charAt(0)?.toUpperCase() + str?.slice(1);

const openTrade: React.FC = ({ ownerAddr, walletSigner }) => {
  const { txHash, setTxHash, setText } = useContext(TxHashContext);
  const [trades, setTrades] = useState([]);

  const [timeNow, setTimeNow] = useState(null);

  useEffect(() => {
    const fetchTimeRemaining = async () => {
      const now = await querуBlockTime(); // Получаем текущее время
      setTimeNow(now);
    };

    fetchTimeRemaining();
  }, []);

  const queryAllOffersF = async () => {
    if (ownerAddr) {
      const tradesData = await queryAllUserTrades(ownerAddr);
      console.log(tradesData);

      const transformedOffers = tradesData.map((item) => {
        const { trade, offer } = item.offer;
        const {
          id,
          offer_id,
          stablecoin_amount,
          created_at,
          state,
          state_history,
        } = trade;
        const { fiat_currency, owner, rate, description, offer_type } =
          offer.offer;

        console.log(trade, offer, id, fiat_currency);

        const formatOwnerText = (owner) => {
          console.log(owner);
          const first8 = owner.slice(0, 10);
          const last5 = owner.slice(-3);
          return `${first8}...${last5}`;
        };

        return {
          tradeId: id,
          offerId: offer_id,
          stablecoin_amount: (Number(stablecoin_amount) / denom),
          fiat_amount: (Number(stablecoin_amount)/ denom) * Number(rate),
          description,
          timestamp_created: created_at,
          fiat: fiat_currency,
          buyFrom: owner,
          state,
          state_history,
          rate,
          offerOwnerText: formatOwnerText(owner),
          tradeSeller: trade.seller,
          tradeBuyer: trade.buyer,
          tradeSellerText: formatOwnerText(trade.seller),
          tradeBuyerText: formatOwnerText(trade.buyer),
          offer_type,
        };
      });

      // Сортируем по имени владельца предложения (offer.owner)
      const sortedOffers = transformedOffers.sort(
        (a, b) => new Date(a.timestamp_created) + new Date(b.timestamp_created)
      );

      console.log(sortedOffers);
      setTrades(sortedOffers);
    }
  };

  useEffect(() => {
    queryAllOffersF();
  }, [ownerAddr, txHash]);

  const handleBtnTx = async (
    action: (tradeId: string) => Promise<any>,
    tradeId: string,
    makerContact?: string
  ) => {
    setTxHash("");
    setText("Waiting for confirmation...");

    try {
      const tx = await action(tradeId, makerContact || undefined); // вызываем action с tradeId

      if (tx && tx.e) {
        setText(tx.e); // Если есть ошибка, устанавливаем текст ошибки
      } else if (tx) {
        setText("Executed!"); // Успешное выполнение
        setTxHash(tx); // Устанавливаем txHash
      }
    } catch (error) {
      setText("Transaction failed!"); // Обработка ошибок
      console.error(error); // Логирование ошибки в консоль
    }
  };

  const handleBtnEsceow = async (trade: any) => {
    setTxHash("");
    setText("Waiting for confirmation...");
    const stablecoinAmount = Number(trade?.stablecoin_amount);
    console.log(
      stablecoinAmount,
      Math.floor(Number((stablecoinAmount * 1.005).toFixed(3)))
    );

    const tx = await btnTradeFundEscrow(
      Math.floor(stablecoinAmount * 1.005),
      Number(trade.tradeId),
      "123"
    );

    if (tx.e) {
      setTxHash("");
      setText(tx.e);
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
    }
  };

  const activeTrades = trades.filter(
    (trade) =>
      trade.state !== "request_created" &&
      trade.state !== "request_canceled" &&
      trade.state !== "escrow_released" &&
      trade.state !== "request_expired"
    //   ||
    // (trade.state === "escrow_funded" &&
    //   offerIsActive(trade.state_history, timeNow)?.date === true)
  );

  const requestTrades = trades.filter(
    (trade) => trade.state === "request_created" && trade.buyFrom === ownerAddr
  );

  const sentRequestTrades = trades.filter(
    (trade) => trade.state === "request_created" && trade.buyFrom !== ownerAddr
  );

  console.log(requestTrades, sentRequestTrades, activeTrades);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Вычисляем общее количество страниц на основе отфильтрованных офферов
  const totalPages = Math.ceil(trades.length / itemsPerPage);

  const currentTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="trades">
      <div className="container">
        <h2 className="title title_h2 title_aic">Open Trades</h2>
        <div className="trades__list">
          <div className="trades__item">
            {activeTrades.length > 0 ? (
              <>
                {" "}
                {activeTrades.map((trade, index) => (
                  <div className="trades__item-inner" key={index}>
                    <div className="trades__col">
                      <div className="trades__item-name">
                        {trade?.tradeBuyer === ownerAddr ? "Buying" : "Selling"}{" "}
                        USDC
                      </div>
                      <div className="trades__item-user trades__item-label">
                        {trade?.tradeBuyer === ownerAddr ? (
                          <>from {trade.tradeSellerText}</>
                        ) : (
                          <>to {trade.tradeBuyerText}</>
                        )}
                      </div>
                    </div>
                    <div className="trades__col">
                      <div className="trades__item-label">Amount</div>
                      <div className="trades__item-content">
                        {trade.stablecoin_amount} USDC
                      </div>
                      <div
                        className="trades__item-content"
                        style={{ color: "#b0b0b0" }}
                      >
                        {trade.fiat.replace(/_/g, "").toUpperCase()}&nbsp;
                        {new Intl.NumberFormat().format(trade.fiat_amount)}
                      </div>
                    </div>
                    <div className="trades__col">
                      <div className="trades__item-label">Status</div>
                      <div className="trades__item-content trades__item-content_accent">
                        {capitalizedFirst(trade.state.replace(/_/g, " "))}
                      </div>
                    </div>
                    <div className="trades__col">
                      <div>
                        {trade.state !== "request_accepted" &&
                          trade.state !== "escrow_released" &&
                          trade.state !== "request_created" && (
                            <>
                              <div className="trades__item-label">
                                Time remaining
                              </div>
                              <div className="trades__item-content">
                                <>
                                  {
                                    offerIsActive(trade.state_history, timeNow)
                                      ?.el
                                  }
                                </>
                              </div>
                            </>
                          )}
                      </div>
                      <a
                        className="btn btn_accent"
                        href={`/trade/${trade.tradeId}`}
                      >
                        View&nbsp;trade
                      </a>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: "#f2284e",
                  }}
                >
                  You don’t have any open trades!<br></br>
                  <br></br>
                </div>
              </>
            )}

            {sentRequestTrades.length > 0 && (
              <h2 className="title title_h2 title_aic">Sent requests</h2>
            )}

            {sentRequestTrades.map((trade, index) => (
              <div className="trades__item-inner" key={index}>
                <div className="trades__col">
                  <div className="trades__item-name">
                    {trade.offer_type !== "sell" ? "Selling" : "Buying"}{" "}
                    {/* {trade.fiat.replace(/_/g, "").toUpperCase()} */}
                    USDC
                  </div>
                  <div className="trades__item-user trades__item-label">
                    Request to {trade.offerOwnerText}
                  </div>
                </div>
                <div className="trades__col">
                  <div className="trades__item-label">Amount</div>
                  <div className="trades__item-content">
                    {trade.stablecoin_amount} USDC
                  </div>
                  <div
                    className="trades__item-content"
                    style={{ color: "#b0b0b0" }}
                  >
                    {trade.fiat.replace(/_/g, "").toUpperCase()}&nbsp;
                    {new Intl.NumberFormat().format(trade.fiat_amount)}
                  </div>
                </div>
                <div className="trades__col">
                  <div className="trades__item-label">Status</div>
                  <div className="trades__item-content trades__item-content_accent">
                    {capitalizedFirst(trade.state.replace(/_/g, " "))}
                  </div>
                </div>
                <div className="trades__col">
                  <div>
                    {trade.state !== "request_accepted" &&
                      trade.state !== "escrow_released" &&
                      trade.state !== "request_created" && (
                        <>
                          <div className="trades__item-label">
                            Time remaining
                          </div>
                          <div className="trades__item-content">
                            <>
                              {offerIsActive(trade.state_history, timeNow)?.el}
                            </>
                          </div>
                        </>
                      )}
                  </div>
                  {/* <Link
                    className="btn btn_accent"
to={`/trade/${trade.tradeId}`}
                  >
                    See
                  </Link> */}
                  <a
                    className="btn btn_accent"
                    onClick={() =>
                      handleBtnTx(btnCancelTradeRequest, trade.tradeId)
                    }
                  >
                    Cancel&nbsp;my&nbsp;request
                  </a>
                </div>
              </div>
            ))}

            {requestTrades.length > 0 && (
              <h2 className="title title_h2 title_aic">Trade Requests</h2>
            )}

            {requestTrades.map((trade, index) => (
              <div className="trades__item-inner" key={index}>
                <div className="trades__col">
                  <div className="trades__item-name">
                    {trade.offer_type !== "sell" ? "Selling" : "Buying"}{" "}
                    {/* {trade.fiat.replace(/_/g, "").toUpperCase()} */}
                    USDC
                  </div>
                  <div className="trades__item-user trades__item-label">
                    from{" "}
                    {trade.offer_type === "sell"
                      ? trade.tradeBuyerText
                      : trade.tradeSellerText}{" "}
                  </div>
                </div>
                <div className="trades__col">
                  <div className="trades__item-label">Amount</div>
                  <div className="trades__item-content">
                    {trade.stablecoin_amount} USDC
                  </div>
                  <div
                    className="trades__item-content"
                    style={{ color: "#b0b0b0" }}
                  >
                    {trade.fiat.replace(/_/g, "").toUpperCase()}&nbsp;
                    {new Intl.NumberFormat().format(trade.fiat_amount)}
                  </div>
                </div>
                <div className="trades__col">
                  <div className="trades__item-label">Status</div>
                  <div className="trades__item-content trades__item-content_accent">
                    {capitalizedFirst(trade.state.replace(/_/g, " "))}
                  </div>
                </div>
                <div className="trades__col">
                  <div>
                    {trade.state !== "request_accepted" &&
                      trade.state !== "escrow_released" &&
                      trade.state !== "request_created" && (
                        <>
                          <div className="trades__item-label">
                            Time remaining
                          </div>
                          <div className="trades__item-content">
                            <>
                              {offerIsActive(trade.state_history, timeNow)?.el}
                            </>
                          </div>
                        </>
                      )}
                  </div>

                  {trade?.offer_type === "sell" &&
                  trade?.state === "request_created" ? (
                    <>
                      {/* <a
                        className="btn btn_accent"
                        onClick={() =>
                          handleBtnEsceow(trade)
                        }
                      >
                        Accept (fund {Math.round(trade.stablecoin_amount * 1.005)} USDC)
                      </a> */}
                      {/* <a
                        className="btn btn_accent"
                        onClick={() =>
                          handleBtnTx(btnCancelTradeRequest, trade.tradeId)
                        }
                      >
                        Reject
                      </a> */}
                      <a
                        className="btn btn_accent"
                        href={`/trade/${trade.tradeId}`}
                      >
                        View&nbsp;trade
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        className="btn btn_accent"
                        onClick={() =>
                          handleBtnTx(
                            btnAcceptTradeRequest,
                            trade.tradeId,
                            "makerContact"
                          )
                        }
                      >
                        Accept
                      </a>
                      <a
                        className="btn btn_accent"
                        onClick={() =>
                          handleBtnTx(btnCancelTradeRequest, trade.tradeId)
                        }
                      >
                        Reject
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}

            <br></br>
            <h2 className="title title_h2">Trade History</h2>
            {trades.length > 0 ? (
              <div className="table-wrap">
                <div className="table scroll-js">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Crypto</th>
                        <th>Amount</th>
                        <th>Trader</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTrades.map((trade, index) => (
                        <tr key={index}>
                          <td>
                            <div className="table__td-inner">
                              <div className="icon">
                                <svg>
                                  <use xlinkHref={`${sprite}#hashtag`} />
                                </svg>
                              </div>
                              {trade.tradeId}
                            </div>
                          </td>
                          <td>{timestampToDate(trade.timestamp_created)}</td>
                          <td>
                            {trade.offer_type !== "sell" ? "Selling" : "Buying"}{" "}
                          </td>
                          <td>{trade.stablecoin_amount} USDC</td>
                          <td>
                            {" "}
                            {trade.fiat.replace(/_/g, "").toUpperCase()}{" "}
                            {new Intl.NumberFormat().format(trade.fiat_amount)}
                          </td>
                          <td>
                            {" "}
                            {trade.offer_type === "sell"
                              ? trade.tradeBuyerText
                              : trade.tradeSellerText}{" "}
                          </td>
                          <td>
                            <>
                              {trade.state === "escrow_released" ||
                              trade.state === "request_expired" ? (
                                "Completed"
                              ) : (
                                <>
                                  {capitalizedFirst(
                                    trade.state.replace(/_/g, " ")
                                  )}
                                  &nbsp;
                                  {offerIsActive(trade.state_history, timeNow)
                                    .date ? null : (
                                    <div
                                      className="trades__item-content"
                                      style={{ color: "#b0b0b0" }}
                                    >
                                      {
                                        offerIsActive(
                                          trade.state_history,
                                          timeNow
                                        ).el
                                      }
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: "#f2284e",
                  }}
                >
                  No have trades<br></br>
                  <br></br>
                </div>
              </>
            )}

            {totalPages > 1 && (
              <div className="pagination pagination_centered">
                <ul>
                  <li className="pagination__start">
                    <a
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#doubleangle`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li className="pagination__back">
                    <a
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#angle`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index}
                      className={currentPage === index + 1 ? "active" : ""}
                    >
                      <a onClick={() => setCurrentPage(index + 1)}>
                        {index + 1}
                      </a>
                    </li>
                  ))}
                  <li className="pagination__forward">
                    <a
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#angle`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li className="pagination__end">
                    <a
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#doubleangle`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default openTrade;
