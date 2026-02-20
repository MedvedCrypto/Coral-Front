import React, { useCallback, useContext, useEffect, useState } from "react";
import "../js/app.min.js";
import "../../css/style.css";
import TxHashContext from "./../context/txHash.tsx";
import sprite from "../../images/sprite.svg";
import { useParams } from "react-router-dom";
import {
  btnTradeFundEscrow,
  btnTradeReleaseEscrow,
  btnTradeSetDepositedFiat,
  querуBlockTime,
  querуTrade,
} from "../buttons/btnLend.ts";
import { TradeInfo } from "../../common/codegen/Trade.types.ts";
import Arrow from "./Arrow.tsx";
import ReactModal from "react-modal";
import ModalConfirm from "../Modl2/ModlConfirm.tsx";

const denom = 1000000

interface LendProps {
  ownerAddr: string;
}

interface PaymentMethod {
  value: string;
  text: string;
  imgSrc: string;
}

const offerIsActive = function (state_history: Array<StateEntry>, timeNow: number): OfferIsActiveResult {
  if (!Array.isArray(state_history)) {
    console.log("state_history must be an array");
    return { el: <div>Time's up</div>, date: true }; // Возвращаем React-элемент
  } else {
    const escrowFundedEntry = state_history.find(
      (entry) => entry.state === "escrow_funded"
    );

    if (escrowFundedEntry && typeof escrowFundedEntry.timestamp === 'number') {
      const now = timeNow; // Получаем текущее время
      const timeRemaining = escrowFundedEntry.timestamp + 21600 - now; // 21600 секунд = 6 часов
      console.log(timeRemaining)

      if (timeRemaining <= 0) {
        return { el: <div>Time's up</div>, date: false }; // Возвращаем React-элемент
      }

      const minutesRemaining = Math.floor((timeRemaining  / 60) % 60); // Остаток минут
      const hoursRemaining = Math.floor(timeRemaining  / 60 / 60); // Остаток часов

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
}

const paymentMethods: PaymentMethod[] = [
  { value: "ppl", text: "Paypal" },
  { value: "bnk", text: "Bank" },
  { value: "ws", text: "Wise" },
];

const formatOwnerText = (owner: string) => {
  const first8 = owner.slice(0, 10);
  const last5 = owner.slice(-3);
  return `${first8}...${last5}`;
};



function customRound(num) {
  // Проверяем, является ли число целым (без десятичной части)
  if (Number.isInteger(num)) {
      return num; // Возвращаем число, если оно уже целое
  }

  // Округляем число
  const rounded = Math.round(num);
  
  // Проверяем, если дробная часть больше 0.99, округляем вверх
  if (num - Math.floor(num) > 0.99) {
      return rounded; // Округляем вверх
  } else {
      return Math.floor(num); // Округляем вниз
  }
}

const Trade: React.FC<LendProps> = ({ ownerAddr }) => {
  const { paramTradeId } = useParams();
  const { txHash, setTxHash, setText } = useContext(TxHashContext);

  const [trade, setTrade] = useState<TradeInfo>();
  const [timeNow, setTimeNow] = useState(null);
  useEffect(() => {
    const fetchTimeRemaining = async () => {
      const now = await querуBlockTime(); // Получаем текущее время
      setTimeNow(now);
    };

    fetchTimeRemaining();
  }, []);

  const handleBtnEsceow = async () => {
    setTxHash("");
    setText("Waiting for confirmation...");
    const stablecoinAmount = Number(trade?.trade.stablecoin_amount);

    const tx = await btnTradeFundEscrow(
      customRound(stablecoinAmount * 1.005),
      Number(paramTradeId),
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

  const handleBtnConfirmFiat = async () => {
    setTxHash("");
    setText("Waiting for confirmation...");
    const tx = await btnTradeSetDepositedFiat(Number(paramTradeId));

    if (tx.e) {
      setTxHash("");
      setText(tx.e);
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
    }
  };

  const handleBtnReleaseEscrow = async () => {
    setTxHash("");
    setText("Waiting for confirmation...");
    const tx = await btnTradeReleaseEscrow(Number(paramTradeId));

    if (tx.e) {
      setTxHash("");
      setText(tx.e);
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
    }
  };

  const queryTrade = async () => {
    if (ownerAddr) {
      const tradeData = await querуTrade(Number(paramTradeId));
      console.log(tradeData);

      setTrade(tradeData);
    }
  };

  useEffect(() => {
    queryTrade();
  }, [ownerAddr, txHash]);





  

    const [isVisible, setIsVisible] = useState(false);
    const [onClickConfirm, setOnClickConfirm] = useState(() => () => {});
  
    const handleBtnSetConfirmFiat = async () => {
      setIsVisible(true);
      setOnClickConfirm(() => handleBtnConfirmFiat); // Устанавливаем функцию для подтверждения Fiat
    };
  
    const handleBtnSetConfirmEscrow = async () => {
      setIsVisible(true);
      setOnClickConfirm(() => handleBtnReleaseEscrow); // Устанавливаем функцию для подтверждения Escrow
    };
  
  
    const handleBtnConfirm = async () => {
      setTxHash("");
      setText("Waiting for confirmation...");
  
      // Проверка, является ли onClickConfirm функцией
      if (typeof onClickConfirm === 'function') {
        const tx = await onClickConfirm(); // Вызов функции при клике
  
        if (tx.e) {
          setTxHash("");
          setText(tx.e);
          setIsVisible(false)
        } else if (tx) {
          setText("Executed!");
          setTxHash(tx);
          setIsVisible(false)
        }
      } else {
        console.error("onClickConfirm is not a function");
        setIsVisible(false)
      }
    };
  
    return (
      <div className="steps">
  
        <ModalConfirm 
          onClickConfirm={handleBtnConfirm} 
          isVisible={isVisible} 
          setIsVisible={setIsVisible} 
        />
  

      <div className="container">
        <h2 className="title title_h2">
          {trade?.trade.buyer === ownerAddr ? "Buying" : "Selling"} USDC{" "}
          {trade?.trade.buyer === ownerAddr ? "from" : "to"} {trade?.trade.buyer !== ownerAddr ? `${trade?.trade.buyer || ""}` : `${trade?.trade.seller}`}{" "}
        </h2>
        <div className="steps__top">
          <div className="steps__item">
            <div className="steps__step passed">
              <div className="steps__count">
                {" "}
                <span>1 </span>
                <div className="icon">
                  <svg>
                    <use xlinkHref={`${sprite}#check2`} />
                  </svg>
                </div>
              </div>
              <div className="steps__label">Request accepted</div>
            </div>
          </div>
          <div className="steps__item">
            <div
              className={`steps__step ${(trade?.trade.state === "request_accepted" || (trade?.offer.offer.offer_type === "sell" && trade?.trade.state === "request_created")) ? "active" : ""} ${(["escrow_funded", "fiat_deposited", "escrow_released"].includes(trade?.trade.state)) ? "passed": ""}`}
            >
              <div className="steps__count">
                {" "}
                {["fiat_deposited", "escrow_released", "escrow_funded"].includes(trade?.trade.state) ? (
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#check2`} />
                    </svg>
                  </div>
                ) : (
                  <span>2</span>
                )}
              </div>
              <div className="steps__label">Sending Crypto</div>
            </div>
          </div>
          <div className="steps__item">
            <div
              className={`steps__step ${["escrow_funded", "fiat_deposited"].includes(trade?.trade.state) ? "active" : ""} ${trade?.trade.state === "escrow_released" ? "passed" : ""}`}
            >
              <div className="steps__count">
                {trade?.trade.state === "escrow_released" ? (
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#check2`} />
                    </svg>
                  </div>
                ) : (
                  <span>3</span>
                )}
              </div>
              <div className="steps__label">Sending Fiat</div>
            </div>
          </div>
          {/* <div className="steps__item">
            <div
              className={`steps__step ${trade?.trade.state === "fiat_deposited" ? "active" : ""}`}
            >
              <div className="steps__count">
                {" "}
                <span>4</span>
                {trade?.trade.state === "fiat_deposited" ? (
                  ""
                ) : (
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#check2`} />
                    </svg>
                  </div>
                )}
              </div>
              <div className="steps__label">Fiat confirmation</div>
            </div>
          </div> */}
          <div className="steps__item steps__item_time">
            <div>
              <div className="steps__label-mobile">Waiting for payment</div>
              {trade?.trade.state === "escrow_released" ? (
                <>
                  <div className="steps__item-label"></div>
                  <div className="steps__time">Completed!</div>
                </>
              ) : (
                <>
                  {trade?.trade.state !== "request_accepted" &&
                          trade?.trade.state !== "escrow_released" &&
                          trade?.trade.state !== "request_created" && (
                            <>
                              <div className="trades__item-label">
                                Time remaining
                              </div>
                              <div className="trades__item-content">
                                <>
                                  {
                                    offerIsActive(trade?.trade.state_history, timeNow)
                                      ?.el
                                  }
                                </>
                              </div>
                            </>
                          )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="steps__content">
          <div className="steps__content-col">
            <div className="steps__content-item">
              <div>
                <div className="steps__contacts-top">Contact information </div>
                <div className="steps__contacts-text">
                  Open a chat with the other trader so you can exchange
                  information about payment.
                </div>
                <a
                  className="steps__contacts-link steps__contacts-link_tg"
                  href={`/chat/${trade?.trade.buyer !== ownerAddr ? `${trade?.trade.buyer || ""}` : `${trade?.trade.seller}`}`}
                >
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#telegram`} />
                    </svg>
                  </div>
                  <span>Open chat </span>
                </a>
              </div>
              <div className="steps__contacts-bottom">
                <div className="steps__contacts-info">
                  <div className="steps__contacts-info-new">new!</div>
                  <div className="steps__contacts-text">
                    Get notifications on Telegram or Browser
                  </div>
                </div>
                <a className="steps__content-btn" href="#">
                  Register new alert
                </a>
                {/* <div className="steps__contacts-powered-by">
                  Powered by <a href="#">Capybora Labs</a>
                </div> */}
              </div>
            </div>
          </div>
          <div className="steps__content-col">
            <div className="steps__content-item">
              <div className="steps__content-item-col">
                <div className="steps__content-item-payments">
                  <h2>Payment method</h2>
                  {/* <span>Wise</span> */}
                  {trade?.offer.offer.description ? (
                    <>
                      {" "}
                      {(() => {
                        try {
                          const methods =
                            JSON.parse(trade?.offer.offer.description).m || [];

                          return methods.map(
                            (
                              method: any,
                              index: React.Key | null | undefined
                            ) => {
                              // Находим соответствующий объект в paymentMethods по значению method
                              const paymentMethod = paymentMethods.find(
                                (pm) => pm.value === method
                              );
                              return (
                                <div
                                  className="sellers-table__payment-item"
                                  key={index}
                                >
                                  {/* Проверяем, найден ли соответствующий объект */}
                                  {paymentMethod ? (
                                    <>
                                      <div className="sellers-table__payment-name">
                                        {paymentMethod.text}
                                      </div>
                                      {paymentMethod.imgSrc && (
                                        <img
                                          src={paymentMethod.imgSrc}
                                          alt={paymentMethod.text}
                                        />
                                      )}
                                      <br></br>
                                      <br></br>
                                    </>
                                  ) : (
                                    <div className="sellers-table__payment-name">
                                      Unkn
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          );
                        } catch (error) {
                          console.error("Ошибка разбора JSON:", error);
                          return <div>Error</div>; // Возвращаем сообщение об ошибке
                        }
                      })()}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="steps__content-item-col">
                <div className="steps__content-item-price">
                  <div className="steps__content-price-wrap">
                    <h2>Price </h2>
                    <div className="steps__content-price-list">
                      <div className="steps__content-price-item">
                        <span>{trade?.trade.stablecoin_amount} USDC</span>
                        <span>
                          {trade?.offer.offer.fiat_currency
                            ?.replace(/_/g, "")
                            .toUpperCase()}{" "}
                          {trade?.offer.offer.rate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="steps__content-item-price">
                  <div className="steps__content-price-wrap">
                    <h2>Transaction summary </h2>
                    <div className="steps__content-price-list">
                      <div className="steps__content-price-item">
                        <span>Selling</span>
                        <span>{Number(trade?.trade.stablecoin_amount) / denom} USDC</span>
                      </div>
                      <div className="steps__content-price-item">
                        <span>Platform fee (0.5%)</span>
                        <span>
                          {(
                            Number(trade?.trade.stablecoin_amount) * 0.005 / denom
                          ).toFixed(3)}{" "}
                          USDC
                        </span>
                      </div>
                      <div className="steps__content-price-item">
                        <span>Total</span>
                        <span>
                          {((
                            Number(trade?.trade.stablecoin_amount) * 0.005 +
                            Number(trade?.trade.stablecoin_amount)
                          )/ denom).toFixed(3)}{" "}
                          USDC
                        </span>
                      </div>
                      <div className="steps__content-price-item steps__content-price-item_total">
                        <span>
                          {trade?.trade.buyer === ownerAddr
                            ? "You will receive"
                            : "You will receive"}
                        </span>
                        <span>
                          {trade?.trade.buyer === ownerAddr ? (
                            <>{Number(trade?.trade.stablecoin_amount)/ denom} USDC</>
                          ) : (
                            <>
                              {trade?.offer.offer.fiat_currency
                                ?.replace(/_/g, "")
                                .toUpperCase()}{" "}
                              {((
                                Number(trade?.trade.stablecoin_amount) *
                                Number(trade?.offer.offer.rate)
                              )/ denom).toFixed(2)}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="steps__content-item">
              <div className="steps__content-mark">
                {(trade?.trade.state === "request_accepted" ||
                  (trade?.offer.offer.offer_type === "sell" &&
                    trade?.trade.state === "request_created")) && (
                  <>
                    {trade?.trade.buyer === ownerAddr ? (
                      <div className="steps__content-mark-col">
                        <p>
                          We are waiting for the seller to move USDC into the
                          contract.
                          <br />
                          You can write to him to speed up this process
                        </p>
                      </div>
                    ) : (
                      <>
                        <Arrow />

                        <div className="steps__content-mark-col">
                          <p>
                            Click the button to send{" "}
                            {(Number(trade?.trade.stablecoin_amount) + Number(trade?.trade.stablecoin_amount) * 0.005) / denom} USDC to a contract.
                            <br />
                            After that we will wait for the transfer of fiat
                          </p>
                          <a
                            className="btn btn_accent btn_cetered"
                            onClick={handleBtnEsceow }
                          >
                            Send Crypto
                          </a>
                        </div>
                      </>
                    )}
                  </>
                )}
                {trade?.trade.state === "escrow_funded" && (
                  <>
                    {trade?.trade.buyer === ownerAddr ? (
                      <>
                        <Arrow />
                        <div className="steps__content-mark-col">
                          <p>
                            Transfer the fiat to the seller
                            <br />
                            Only then click on the button
                          </p>
                          <a
                            className="btn btn_accent btn_cetered"
                            onClick={ handleBtnSetConfirmFiat }
                          >
                            Mark as paid
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="steps__content-mark-col">
                          <p>
                            We are now waiting for the buyer to transfer fiat to
                            you
                            <br />
                            After the fiat is received by you, complete the
                            trade
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
                {trade?.trade.state === "fiat_deposited" && (
                  <>
                    {trade?.trade.buyer === ownerAddr ? (
                      <>
                        <div className="steps__content-mark-col">
                          <p>
                            We are now waiting for the user to confirm that the
                            fiat has been received
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Arrow />
                        <div className="steps__content-mark-col">
                          <p>
                            We are now waiting for the buyer to transfer fiat to
                            you
                            <br />
                            After the fiat is received by you, complete the
                            trade
                          </p>
                          <a
                            className="btn btn_accent btn_cetered"
                            onClick={handleBtnSetConfirmEscrow}
                          >
                            Confirm&nbsp;Fiat
                          </a>
                        </div>
                      </>
                    )}
                  </>
                )}
                {trade?.trade.state === "escrow_released" && (
                  <>
                    <div className="steps__content-mark-col">
                      <p>The trade has been successfully completed!</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="steps__text">
          <p>
            Please note that requesting to cancel the transaction could <br />{" "}
            impact on your reputation.{" "}
          </p>
          <a href="#"> Request cancel</a>
        </div>
      </div>
    </div>
  );
};

export default Trade;
