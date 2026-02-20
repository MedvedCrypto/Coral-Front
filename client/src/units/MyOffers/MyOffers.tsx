import React, { useCallback, useContext, useEffect, useState } from "react";
import LendingDetails from "./LendDetails/LendingDetails.tsx";
import { NumericFormat } from "react-number-format";
// import "../js/app.min.js";
import "../../css/style.css";
import TxHashContext from "./../context/txHash.tsx";

import Bank from "../../images/dist/bank.webp";

import MyOpenOffer from "./MyOpenOffer.tsx";

import {
  btnCreateOffer,
  queryMyOffers,
} from "../buttons/btnLend.ts";

import sprite from "../../images/sprite.svg";

const denom = 1_000_000;
// const denom = 1;

const fetchCurrencyRates = async () => {
  const cacheKey = 'currencyRates';
  const cacheTimeKey = 'currencyRatesFetchTime';
  const cacheDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  const currentTime = Date.now();
  const lastFetchTime = localStorage.getItem(cacheTimeKey);

  // Check if cached data is available and is still valid
  if (lastFetchTime && (currentTime - lastFetchTime < cacheDuration)) {
      const cachedRates = localStorage.getItem(cacheKey);
      return JSON.parse(cachedRates); // Возвращаем закэшированные курсы валют
  }

  try {
      const response = await fetch('https://www.cbr-xml-daily.ru/latest.js');
      const data = await response.json();
      
      // Кэшируем курсы валют и время запроса
      localStorage.setItem(cacheKey, JSON.stringify(data.rates));
      localStorage.setItem(cacheTimeKey, currentTime);

      return data.rates; // Возвращаем курсы валют
  } catch (error) {
      console.error('Ошибка при загрузке курсов валют:', error);
      throw new Error('Не удалось загрузить курсы валют');
  }
};


const convertCurrency = async (amount:number, from:string, to:string) => {
  try {
      // Загружаем курсы валют
      const rates = await fetchCurrencyRates();

      // Если валюта 'RUB', используем базовые курсы
      let convertedAmount;
      if (from === 'USD' && to === 'RUB') {
        const usdToRubleRate = 1 / rates['USD']; // Получаем курс USD в RUB
        convertedAmount = amount * usdToRubleRate; // Конвертируем
    } else if (from === 'RUB' && to === 'USD') {
        const rubToUsdRate = rates['USD']; // Получаем курс RUB в USD
        convertedAmount = amount / rubToUsdRate; // Конвертируем
    } else {
        const fromRate = rates[from];
        const toRate = rates[to];
        if (!fromRate || !toRate) {
            throw new Error('Неверные валюты');
        }
        // Конвертация из одной валюты в другую
        convertedAmount = (amount / fromRate) * toRate;
    }

      return convertedAmount;
  } catch (error) {
      console.error('Ошибка конвертации:', error);
      return null;
  }
};




interface LendProps {
  ownerAddr: string;
}

interface PaymentMethod {
  value: string;
  text: string;
  imgSrc: string;
}

interface CryptoOption {
  value: string;
  text: string;
  imgSrc: string;
}

const fiatOptions: CryptoOption[] = [
  { value: "u_s_d", text: "USD", imgSrc: usdImg },
  { value: "e_u_r", text: "EUR", imgSrc: eurImg },
  {
    value: "r_u_b",
    text: "RUB",
    imgSrc:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Russia.png",
  },
];

import usdcImg from "../../images/dist/axl.webp";
// import kujiImg from "../images/dist/kuji.webp";
import uskImg from "../../images/dist/usk.webp";

import usdImg from "../../images/dist/usd.webp";
import eurImg from "../../images/dist/eur.webp";
// import rubImg from "../images/dist/deda.jpg";

import payPalImg from "../../images/dist/paypal.webp";
import wiseImg from "../../images/dist/wise.webp";
import Fiat from "../Buy/Fiat.tsx";
import Method from "../Buy/Method.tsx";

const cryptoOptions: CryptoOption[] = [
  { value: "USDC", text: "USDC", imgSrc: usdcImg },
  { value: "USK", text: "USK", imgSrc: uskImg },
  // { value: "KUJI", text: "KUJI", imgSrc: kujiImg },
];

const paymentMethods: PaymentMethod[] = [
  { value: "ppl", text: "Paypal", imgSrc: payPalImg },
  { value: "bnk", text: "Bank", imgSrc: Bank },
  { value: "ws", text: "Wise", imgSrc: wiseImg },
];

const Lend: React.FC<LendProps> = ({ ownerAddr }) => {

  const { txHash, setTxHash, setText } = useContext(TxHashContext);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleBtnOpenTrade = async () => {
    if (isProcessing) return;
    const errors = [];

    if (rate === "") {
      errors.push("Enter a Rate! \n\n");
    }

    // if (ownerContact === undefined) {
    //   errors.push("Enter you telegram username! \n\n");
    // }

    if (minAmount === "") {
      errors.push("Enter a Min Amount! \n\n");
    }

    if (maxAmount === "") {
      errors.push("Enter a Max Amount! \n\n");
    }

    if (minAmount >= maxAmount) {
      errors.push("Min Amount must be LESS than max Amount! \n\n");
    }

    if (selectedMethods.length === 0) {
      errors.push("Select any Payment method! \n\n");
    }

    if (errors.length > 0) {
      setTxHash("");
      setText(
        <div>
          {errors.map((error, index) => (
            <div>
              <p key={index}>{error}</p>
              <br></br>
            </div>
          ))}
        </div>
      );
      return; // Выходим из функции, если есть ошибки
    }

    const offerData = {
      description: JSON.stringify({ m: selectedMethods, d: description }),
      fiat_currency: fiatCurrency.value,
      max_amount: String(maxAmount * denom),
      min_amount: String(minAmount * denom),
      offer_type: offerType,
      rate: String(rate),
    };

    console.log("Offer Data:", offerData);

    if (!ownerAddr) {
      setTxHash("");
      setText("Connect wallet!");
      return;
    }

    setTxHash("");
    setText("Waiting for confirmation...");
    setIsProcessing(true);

    const tx = await btnCreateOffer(offerData);

    if (tx.e) {
      setTxHash("");
      setText(tx.e);
      setIsProcessing(false); 
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
      setIsProcessing(false); 
      setMaxAmount("")
      setMinAmount("")
      setRate("")
      setOwnerContact("")
    }
  };

  const queryAllOffersF = async () => {
    if (ownerAddr) {
      const offersData = await queryMyOffers(ownerAddr);

      console.log(offersData);

      const transformedOffers = offersData.map((item) => {
        function isValidJSON(str) {
          try {
            JSON.parse(str);
            return true;
          } catch (e) {
            return false;
          }
        }
        let jsonString;
        let valid = false;
        if (isValidJSON(item.offer?.description)) {
          valid = true;
          jsonString = JSON.parse(item.offer?.description);
        } else {
          valid = false;
          jsonString = item.offer?.description; // Используем оригинальную строку
        }
        return {
          methods: jsonString?.m,
          description: item.offer.description,
          fiat: item.offer.fiat_currency,
          maker: item.offer.owner,
          offerId: item.offer.id,
          state: item.offer.state,
          offer_type: item.offer.offer_type,
          percent: (Math.random() * 100).toFixed(2), // Пример случайного процента, замените на нужное значение
          trades: item.profile.active_offers_count, // Используем количество активных предложений
          limit: [
            parseFloat(item.offer.min_amount),
            parseFloat(item.offer.max_amount),
          ], // Минимальная и максимальная сумма
          priceRatio: parseFloat(item.offer.rate), // Соотношение цены
        };
      });

      console.log(transformedOffers);
      setOffers(transformedOffers);
    }
  };

  useEffect(() => {
    queryAllOffersF();
  }, [ownerAddr, txHash]);

  const [description, setDescription] = useState<string>("");
  const [fiatCurrency, setFiatCurrency] = useState(fiatOptions[0]);
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [offerType, setOfferType] = useState<"buy" | "sell">("sell");
  const [ownerContact, setOwnerContact] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [offers, setOffers] = useState([]);

  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  const [currentRate, setCurrentRate] = useState(1)
 

  const selectMethod = (value: string) => {
    console.log(selectedMethods);

    if (selectedMethods.includes(value)) {
      // Удалить из выбора
      setSelectedMethods(selectedMethods.filter((method) => method !== value));
    } else {
      // Проверяем, не превышает ли количество выбранных методов 3
      if (selectedMethods.length < 3) {
        // Добавить в выбор
        setSelectedMethods([...selectedMethods, value]);
      } else {
        setText("You can't select more than 3 methods."); // Сообщение или другое действие
      }
    }
  };

  const selectFiat = async (value: any) => {
    console.log(fiatCurrency, value.text);
    setFiatCurrency(value);
    const rate = (await convertCurrency(1,"USD",value.text))?.toFixed(2)
    console.log(rate)
    setCurrentRate(rate)
    
  };

  const getSelectedMethodText = () => {
    if (selectedMethods.length === 0) {
      return "Select";
    } else if (selectedMethods.length === 1) {
      return (
        paymentMethods.find((method) => method.value === selectedMethods[0])
          ?.text || ""
      );
    } else {
      return `${selectedMethods.length} selected`;
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // Фильтруем офферы, исключая те, которые находятся в состоянии "archive"
  const filteredOffers = offers.filter((offer) => offer.state !== "archive");

  // Вычисляем общее количество страниц на основе отфильтрованных офферов
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  // Определяем текущие офферы для отображения
  const currentOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <body>
      <div className="wrapper">
        <div className="content">
          <div className="popup popup-js scroll-js" style={{ zIndex: 999999 }}>
            <div className="popup__window">
<div style={{display: "flex",     alignItems: "flex-start",
    justifyContent: "space-between"}}>
              <h2 className="title title_h2">Create Offer</h2>
              <button
                  className="btn btn_cancel popup-cancel-js"
                  style={{ position: "relative" }}
                >
                  {" "}
                  <div className="btn btn_gray my-offers-edit-js">Close</div>
                </button>
                </div>
              <div>
              <div className="select__label" style={{width: "100%",
    borderBottom: "1px solid rgb(95 95 95)",
    paddingBottom: "12px"}}>
                        {" "}
                        <div
                          className="input"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <label style={{ marginBottom: 0, marginRight: 12 }}>
                            I&nbsp;want&nbsp;to
                          </label>
                          <div style={{ display: "flex", height: 0 }}>
                            <label
                              style={{
                                marginBottom: 0,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                height: 0,
                              }}
                            >
                              <input
                                style={{
                                  marginBottom: 0,
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  height: 0,
                                }}
                                type="radio"
                                value="buy"
                                checked={offerType === "buy"}
                                onChange={() => setOfferType("buy")}
                              />

                              <span style={{ marginLeft: 6 }}>Buy</span>
                            </label>
                            <label
                              style={{
                                marginBottom: 0,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginLeft: 12,
                              }}
                            >
                              <input
                                style={{
                                  marginBottom: 0,
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                                type="radio"
                                value="sell"
                                checked={offerType === "sell"}
                                onChange={() => setOfferType("sell")}
                              />
                              <span style={{ marginLeft: 6 }}>Sell</span>
                              <span style={{ marginLeft: 12 }}>USDC</span>
                            </label>
                          </div>
                        </div>
                      </div>
                <div
                  className="popup__col-wrap"
                  style={{ alignItems: "center" }}
                >
                  <div className="popup__col popup__col_half">
                    <div className="select select_single">
                    <div className="select__label" >Payment method</div>

                      <Fiat
                        fiatOptions={fiatOptions}
                        selectedCrypto={fiatCurrency}
                        setSelectedCrypto={selectFiat}
                        d={true}
                      />
                    </div>
                  </div>
                  <div className="popup__col popup__col_half">
                    <Method
                      paymentMethods={paymentMethods}
                      getSelectedMethodText={getSelectedMethodText}
                      selectMethod={selectMethod}
                      selectedMethods={selectedMethods}
                      d={true}
                      d2={true}
                    />
                  </div>
                </div>
                <div className="popup__col-wrap popup__col-wrap_input-wrap">
                  <div className="popup__col popup__col_half">
                    <div className="input">
                      <label htmlFor="min-amount">Min amount of USDC</label>
                      <NumericFormat
                        type="text"
                        value={minAmount}
                        onValueChange={(values) => {
                          const { value } = values;
                          const parsedValue = parseFloat(
                            value.replace(/[^0-9.]/g, "")
                          );
                          setMinAmount(isNaN(parsedValue) ? "" : parsedValue);
                        }}
                        required
                        decimalScale={2}
                        thousandSeparator={true}
                        allowNegative={false}
                        placeholder="min 100"
                      />
                    </div>
                  </div>
                  <div className="popup__col popup__col_half">
                    <div className="input">
                      <label htmlFor="max-amount">Max amount of USDC</label>
                      <NumericFormat
                        type="text"
                        value={maxAmount}
                        onValueChange={(values) => {
                          const { value } = values;
                          const parsedValue = parseFloat(
                            value.replace(/[^0-9.]/g, "")
                          );
                          setMaxAmount(isNaN(parsedValue) ? "" : parsedValue);
                        }}
                        required
                        decimalScale={2}
                        thousandSeparator={true}
                        allowNegative={false}
                        placeholder="max 100,000"
                      />
                    </div>
                  </div>
                  <div className="popup__col popup__col_half"></div>
                  <div className="popup__col popup__col_half">
                    <div className="input">
                      <label htmlFor="margin">Rate <span style={{color:"#5a5a5a", marginLeft: "6px"}}>(Actual rate: {currentRate} {fiatCurrency.text} per USD)</span></label>
                      <NumericFormat
                        type="text"
                        value={rate}
                        onValueChange={(values) => {
                          const { value } = values;
                          const parsedValue = parseFloat(
                            value.replace(/[^0-9.,]/g, "").replace(",", ".")
                          );

                          setRate(isNaN(parsedValue) ? "" : parsedValue);
                        }}
                        required
                        decimalScale={3}
                        thousandSeparator={true}
                        allowNegative={false}
                        placeholder={currentRate}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className="popup__col-wrap">
                  <div className="popup__col popup__col_full">
                    <div className="input">
                      <label htmlFor="telegram">Your Telegram username</label>
                      <input
                        type="text"
                        value={ownerContact}
                        onChange={(e) => setOwnerContact(e.target.value)}
                        required
                        placeholder="@MegaBzlomJopu"
                      />
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="popup__bottom">
                <div className="popup__bottom-col">
                  <p>
                    1 USDC = {Number(rate) * 1} {fiatCurrency.text}
                  </p>
                  <p>
                    <div className="input__message">
                      Limits:{" "}
                      {fiatCurrency.text} {new Intl.NumberFormat().format((Number(minAmount) / denom) * Number(rate))} - {fiatCurrency.text} {new Intl.NumberFormat().format((Number(maxAmount) / denom) * Number(rate))}
                    </div>
                  </p>
                </div>

                <div className="popup__bottom-col">
                  <div className="popup__bottom-btn-wrap">
                    <button
                      className="btn btn_accent btn_centered"
                      onClick={() => handleBtnOpenTrade()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-offers">
            <div className="container" style={{overflow: "hidden"}}>
              <h2 className="title title_h2 title_aic">
                My Offers
                <a
                  className="btn btn_gray btn_centered offer-popup-js"
                  // onClick={handleOpenModal}
                >
                  <span>Create offer</span>
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#plus`} />
                    </svg>
                  </div>
                </a>
              </h2>
              <div className="my-offers__list">
                {filteredOffers.length > 0 ? (
                  <>
                    {" "}
                    {currentOffers.map((offer, index) => (
                      <MyOpenOffer
                        methods={offer.methods}
                        description={offer.description}
                        limit={offer.limit}
                        fiat={offer.fiat}
                        offer_type={offer.offer_type}
                        priceRatio={offer.priceRatio}
                        state={offer.state}
                        offerId={offer.offerId}
                        // index={index}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        width: "100%",
                        textAlign: "center",
                        color: "#f2284e",
                        height: "280px",
                      }}
                    >
                      <span style={{ top: 48, position: "relative" }}>
                        There are no created offers!
                      </span>
                    </div>
                  </>
                )}

                {/* {offers.map((offer, index) => (
                  <MyOpenOffer
                    description={offer.description}
                    limit={offer.limit}
                    fiat={offer.fiat}
                    offer_type={offer.offer_type}
                    priceRatio={offer.priceRatio}
                    state={offer.state}
                    offerId={offer.offerId}
                  />
                ))} */}
                {totalPages > 1 && (
                  <div className="pagination pagination_centered">
                    <ul>
                      <li className="pagination__start">
                        <a
                          href="#"
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
                          href="#"
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
                          <a href="#" onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                          </a>
                        </li>
                      ))}
                      <li className="pagination__forward">
                        <a
                          href="#"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
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
                          href="#"
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
      </div>
    </body>
  );
};

export default Lend;
