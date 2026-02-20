import React, { useCallback, useContext, useEffect, useState } from "react";

import $ from "jquery";

const denom = 1_000_000

// import "./js/app.min.js";
import "../css/style.css";
import TxHashContext from "./context/txHash.tsx";


import PayPal from "/images/dist/paypal.webp";
import Wise from "/images/dist/wise.webp";
import Bank from "/images/dist/bank.webp";

import Offer from "./Buy/Offer.tsx";
import Crypto from "./Buy/Crypto.tsx";
import Fiat from "./Buy/Fiat.tsx";
import Method from "./Buy/Method.tsx";

import {
  btnCreateOffer,
  btnTradeOffer,
  btnAddArb,
  queryAllOffers,
} from "./buttons/btnLend.ts";

import sprite from "../images/sprite.svg";

interface LendProps {
  ownerAddr: string;
}

interface PaymentMethod {
  value: string;
  text: string;
  imgSrc: string;
}

interface CryptoOption {
  [x: string]: any;
  value: string;
  text: string;
  imgSrc: string;
}

import usdcImg from "../images/dist/axl.webp";
// import kujiImg from "../images/dist/kuji.webp";
import uskImg from "../images/dist/usk.webp";

import usdImg from "../images/dist/usd.webp";
import eurImg from "../images/dist/eur.webp";
// import rubImg from "../images/dist/deda.jpg";

import payPalImg from "../images/dist/paypal.webp";
import wiseImg from "../images/dist/wise.webp";

const cryptoOptions: CryptoOption[] = [
  { value: "USDC", text: "USDC", imgSrc: usdcImg },
  { value: "USK", text: "USK", imgSrc: uskImg },
  // { value: "KUJI", text: "KUJI", imgSrc: kujiImg },
];

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

const paymentMethods: PaymentMethod[] = [
  // { value: "all", text: "All", imgSrc: "" },
  { value: "ppl", text: "Paypal", imgSrc: payPalImg },
  { value: "bnk", text: "Bank", imgSrc: Bank },
  { value: "ws", text: "Wise", imgSrc: wiseImg },
];

const Lend: React.FC<LendProps> = ({ ownerAddr }) => {

  const [telegramId, setTelegramId] = useState("");

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(
    cryptoOptions[0]
  );
  const [selectedFiat, setSelectedFiat] = useState<CryptoOption>(
    fiatOptions[0]
  );
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [type, setType] = useState<"buy" | "sell">("buy"); // Состояние для активного элемента


  useEffect(() => {
    $(document).ready(function () {
      function updateLinkedWidths() {
        var maxWidths = [];
    
        // Найти максимальную ширину для каждого индекса среди всех .item
        $(".seller-tr-js").each(function () {
          $(this)
            .find(".seller-td-js")
            .each(function (index) {
              var currentWidth = $(this).outerWidth();
              if (
                maxWidths[index] === undefined ||
                currentWidth > maxWidths[index]
              ) {
                maxWidths[index] = currentWidth;
              }
            });
        });
    
        // Установить максимальную ширину для всех элементов .item по индексу
        $(".seller-tr-js").each(function () {
          $(this)
            .find(".seller-td-js")
            .each(function (index) {
              $(this).css("width", maxWidths[index]);
            });
        });
    
        // Установить максимальную ширину для всех элементов .seller-th-js по индексу
        $(".sellers-thead-js .seller-th-js").each(function (index) {
          $(this).css("width", maxWidths[index]);
        });
      }
    
      // Инициализация установки ширины
      updateLinkedWidths();
    
      // Добавление обработчика события resize для обновления ширины при изменении размера окна
      //  $(window).resize(updateLinkedWidths);
    
     $(".seller-buy-js").on("click", function (e) {
       e.preventDefault();
    
       var $currentSellerItem = $(this).parents(".seller-tr-js");
    
       // Убираем 'active' и закрываем все остальные элементы
       $(".seller-tr-js").not($currentSellerItem).removeClass("active");
       $(".sellers-table__tr-bottom")
         .not($currentSellerItem.find(".sellers-table__tr-bottom"))
         .slideUp();
    
       // Добавляем 'active' и открываем текущий элемент
       $currentSellerItem.addClass("active");
       $currentSellerItem.find(".sellers-table__tr-bottom").slideDown();
     });
      $(".seller-cancel-js").on("click", function (e) {
        e.preventDefault();
        $(this).parents(".seller-tr-js").removeClass('active');
        $(this).parents(".seller-tr-js").find('.sellers-table__tr-bottom').slideUp();
      });
    });
  
    // Обработчик клика вне выпадающего меню
    // $(document).on("click", function (event) {
    //   if (!$(event.target).closest(".select").length) {
    //     $(".select__dropdown").removeClass("active");
    //     $(".select-js").removeClass("active");
    //   }
    // });

    $(".switch-js").each(function () {
      let $this = $(this);
      let activeItem = $this.find(".switch__item.active");
      let startBacklight = $this.find(".switch-backlight-js");
      let activeItemPosition = $this.find(".switch__item.active").position();
      startBacklight.css({
        'width': activeItem.outerWidth(),
        'height': activeItem.outerHeight(),
        'left': activeItemPosition.left,
      });
      let eachItem = $(this).find(".switch__item");
      eachItem.on("click", function(){
        $(this).addClass("active");
        let activeItemPosition = $(this).position();
        $this.find(".switch__item").not(this).removeClass('active');
        startBacklight.css({
          width: activeItem.outerWidth(),
          height: activeItem.outerHeight(),
          left: activeItemPosition.left,
        });
      });
    });
  
    // Очистка обработчиков событий при размонтировании компонента
    return () => {
      $(".select-js").off("click");
      $(".select-item-js").off("click");
      $(document).off("click");
    };
  }, [selectedCrypto, selectedFiat, selectedMethods]);


  const handleToggle = (type: "buy" | "sell") => {
    setType(type); // Устанавливаем активный элемент
    var $currentSellerItem = $(this).parents(".seller-tr-js");
    $(".seller-tr-js").not($currentSellerItem).removeClass("active");
    $(".sellers-table__tr-bottom")
      .not($currentSellerItem.find(".sellers-table__tr-bottom"))
      .slideUp();
  };

  const selectMethod = (value: string) => {
    console.log(selectedMethods)
    if (selectedMethods.includes(value)) {
      // Remove from selection
      setSelectedMethods(selectedMethods.filter((method) => method !== value));
    } else {
      // Add to selection
      setSelectedMethods([...selectedMethods, value]);
    }
  };

  const getSelectedMethodText = () => {
    if (selectedMethods.length === 0) {
      return "All";
    } else if (selectedMethods.length === 1) {
      return (
        paymentMethods.find((method) => method.value === selectedMethods[0])
          ?.text || ""
      );
    } else {
      return `${selectedMethods.length} selected`;
    }
  };

  const { txHash, setTxHash, setText } = useContext(TxHashContext);

  const [iWillPay, setIWillPay] = useState(0);
  const [iWillPayFiat, setIWillPayFiat] = useState(0);


  const handleBtnOpenTrade = async (offerId, amount, contact, address) => {
    if (ownerAddr) {
      console.log(amount)
      setText("Waiting for confirmation...");
      const tx = await btnTradeOffer(offerId, Math.floor(amount * denom), contact, address);
      if (tx.e) {
        setText(tx.e);
      } else if (tx) {
        setText("Executed!");
        setTxHash(tx);
      }

      const message = `Hi, kujira1p...ce46v8 seller! 👋
  
      You have a new sale request. Here's all the information:
      
      Telegram: ${telegramId}
      Address: ${ownerAddr}
      Amount: ${iWillPay} (${iWillPayFiat})
      Trading pair: ${selectedCrypto.value || "USDC"}/${selectedFiat.value || "USD"}
      Method: ${selectedMethods}  
  
  ________
  Contact the buyer!
      `;

      // Замените этот токен на ваш токен бота
      const botToken = "7063079282:AAH6hR5XYy6SCjSa8cY3yIrc2K4s1B7R9iI";

      // Ссылка для отправки сообщения в Telegram
      const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=-1002405591848&text=${encodeURIComponent(message)}`;

      try {
        // const response = await fetch(apiUrl);
        // if (response.ok) {
        //   setText("Done!");
        // } else {
        //   setText("Done!");
        // }
      } catch (error) {
        console.error("Ошибка:", error);
        setText("Error...");
      }
    } else {
      setText("Connect wallet!");
    }
  };

  const [offers, setOffers] = useState([
    {
      percent: 50,
      trades: 4,
      limit: [100, 1000],
      priceRatio: 1.04,
      fiat: "e_u_r",
    },
    {
      percent: 80,
      trades: 123,
      limit: [90, 900],
      priceRatio: 1.04,
      fiat: "u_s_d",
    },
    { percent: 92, trades: 20, limit: [10, 400], priceRatio: 1.05 },
  ]);

  const queryAllOffersF = async () => {
    const offersData = await queryAllOffers();

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
      let valid = false
      if (isValidJSON(item.offer?.description)) {
        valid = true
        jsonString = JSON.parse(item.offer?.description);
      } else {
        valid = false
        jsonString = item.offer?.description; // Используем оригинальную строку
      }

      if (item.offer.state !== "active" ){
        valid = false
      }
      // const jsonString = JSON.parse('{"m":["wise","paypal"], "d": "Hello!"}');
      return {
        type: item.offer.offer_type,
        state: item.offer.state,
        valid: valid,
        // description: item.offer.description,
        offerMakerAddress: item.offer.owner,
        methods: jsonString?.m,
        fiat: item.offer.fiat_currency,
        maker: item.offer.owner,
        offerId: item.offer.id,
        percent: (Math.random() * 100).toFixed(2), // Пример случайного процента, замените на нужное значение
        trades: item.profile.released_trades_count, // Используем количество активных предложений
        limit: [
          parseFloat(item.offer.min_amount),
          parseFloat(item.offer.max_amount),
        ], // Минимальная и максимальная сумма
        priceRatio: parseFloat(item.offer.rate), // Соотношение цены
      };
    });

    console.log(transformedOffers);
    setOffers(transformedOffers);
  };

  useEffect(() => {
    queryAllOffersF();
  }, [selectedCrypto, selectedFiat]);

  const [sortedOffers, setSortedOffers] = useState(offers);

  const [sortBy, setSortBy] = useState<string | null>(null);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  useEffect(() => {
    console.log(sortBy, offers);
    if (offers) {
      const sortedOffers = offers.slice().sort((a, b) => {
        if (sortBy === "range") {
          return b.percent - a.percent; // Descending sort by percent
        } else if (sortBy === "trades") {
          return b.trades - a.trades; // Descending sort by trades
        } else {
          return 0; // No sorting if sortBy is null
        }
      });
      console.log(sortedOffers, sortBy);
      setSortedOffers(sortedOffers);
    }
  }, [sortBy, offers]);

  let filteredOffers1 = offers;
  let filteredOffers
  filteredOffers1 = sortedOffers.filter(
    (offer) => offer.fiat === selectedFiat.value
  );
  let filteredOffers2 = filteredOffers1.filter(
    (offer) => offer?.type !== type
  );
  let filteredOffers3 = filteredOffers2.filter(
    (offer) => offer?.valid === true
  );
  if (selectedMethods.length < 1) {
    filteredOffers = filteredOffers3; // Если нет выбранных методов, просто присваиваем все предложения
  } else {
    filteredOffers = filteredOffers3.filter((offer) => {
      // Преобразуем description в объект, если он в формате JSON
      const methods = offer.methods || []; // Извлекаем массив methods
      console.log(methods)
      return selectedMethods.some((method) => methods.includes(method)); // Проверяем, содержится ли метод в массиве methods
    });
  }



  return (
    <body>
      <div className="wrapper">
        <div className="content">
          


          <div className="offer">
            <div className="container" >
              {/* <h2 className="title title_h2 title_centered">
                Top offers from the community
              </h2> */}
          
              <div className="switch switch_centered switch-js">
                <div className="switch__inner">
                  <div className="switch__backlight switch-backlight-js"> </div>
                  <div
                    className={`switch__item ${type === "buy" ? "active" : ""}`}
                    onClick={() => handleToggle("buy")}
                  >
                    Buy
                  </div>
                  <div
                    className={`switch__item ${type === "sell" ? "active" : ""}`}
                    onClick={() => handleToggle("sell")}
                  >
                    Sell
                  </div>
                </div>
              </div>
              <div className="offer__select">
                <div className="offer__input-select">
                  <div className="offer__input-label">Crypto</div>
                  <Crypto
                    cryptoOptions={cryptoOptions}
                    selectedCrypto={selectedCrypto}
                    setSelectedCrypto={setSelectedCrypto}
                  />
                </div>
                <Fiat
                  fiatOptions={fiatOptions}
                  selectedCrypto={selectedFiat}
                  setSelectedCrypto={setSelectedFiat}
                />
                <Method
                  paymentMethods={paymentMethods}
                  getSelectedMethodText={getSelectedMethodText}
                  selectMethod={selectMethod}
                  selectedMethods={selectedMethods}
                />
              </div>
            </div>
          </div>

          <div className="sellers">
            <div className="container">
              <h2 className="title title_h2 title_centered">
              {type === "buy" ? "Buy USDC from these sellers" : "Sell USDC to these buyers"}
              </h2>
              <div className="sellers__table sellers-table">
                <div className="sellers-table__thead sellers-thead-js">
                  <div className="sellers-table__th seller-th-js">Trader </div>
                  <div className="sellers-table__th seller-th-js">Price</div>
                  <div className="sellers-table__th seller-th-js">
                    Trade limit
                  </div>
                  <div className="sellers-table__th sellers-table__th_filter seller-th-js">
                    {" "}
                    <span>Payment method</span>
                    <div className="sellers-table__filter filter">
                      <div className="filter__icon filter-js">
                        <div className="icon">
                          <svg>
                            <use xlinkHref={`${sprite}#filter`} />
                          </svg>
                        </div>
                      </div>
                      <div className="filter__dropdown">
                        <div
                          className="filter__title"
                        >
                          Sort By
                        </div>
                        <div className="filter__list">
                          <ul>
                            <li>
                              <label htmlFor="range">
                                Range
                                <input
                                  id="range"
                                  type="radio"
                                  name="sort"
                                  value="range"
                                  checked={sortBy === "range"}
                                  onChange={() => handleSortChange("range")}
                                />
                                <span />
                              </label>
                            </li>
                            <li>
                              <label htmlFor="trades">
                                Trades
                                <input
                                  id="trades"
                                  type="radio"
                                  name="sort"
                                  value="trades"
                                  checked={sortBy === "trades"}
                                  onChange={() => handleSortChange("trades")}
                                />
                                <span />
                              </label>
                            </li>
                          </ul>
                        </div>

                        <div className="filter__title">Number of pages</div>
                        <div className="filter__number-list">
                          <ul>
                            <li>
                              <input
                                type="radio"
                                name="page"
                                defaultValue={10}
                              />
                              <span>10</span>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="page"
                                defaultValue={25}
                              />
                              <span>25</span>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="page"
                                defaultValue={50}
                              />
                              <span>50</span>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="page"
                                defaultValue={100}
                              />
                              <span>100</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sellers-table__tbody">
                  {filteredOffers.length > 0 ? (
                    <>
                      {filteredOffers.map((offer, index) => (
                        <Offer
                        ownerAddress={ownerAddr}
                          key={index}
                          methods={offer.methods}
                          offerMakerAddress={offer.offerMakerAddress}
                          type={offer.type}
                          maker={offer.maker}
                          offerId={offer.offerId}
                          percent={offer.percent}
                          trades={offer.trades}
                          limit={offer.limit}
                          crypto={selectedCrypto.text}
                          fiat={selectedFiat}
                          priceRatio={offer.priceRatio}
                          setIWillPay={setIWillPay}
                          iWillPay={iWillPay}
                          setIWillPayFiat={setIWillPayFiat}
                          iWillPayFiat={iWillPayFiat}
                          handleBtnOpenTrade={handleBtnOpenTrade}
                          setTelegramId={setTelegramId}
                          telegramId={telegramId}
                          
                        />
                      ))}
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: "1.5rem",
                        width: "100%",
                        textAlign: "center",
                        color: "#f2284e",
                        height: "480px",
                      }}
                    >
                      <span style={{ top: 48, position: "relative" }}>
                      There are no offers for this currency!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pagination pagination_centered">
              <ul>
                <li className="pagination__start">
                  <a href="#">
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#doubleangle`} />
                      </svg>
                    </div>
                  </a>
                </li>
                <li className="pagination__back">
                  <a href="#">
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#angle`} />
                      </svg>
                    </div>
                  </a>
                </li>
                <li className="active">
                  <a href="#">1</a>
                </li>
                {/* <li>
                  {" "}
                  <a href="#">2</a>
                </li>
                <li>
                  {" "}
                  <a href="#">3</a>
                </li>
                <li>. . .</li>
                <li>
                  {" "}
                  <a href="#">7</a>
                </li>
                <li>
                  {" "}
                  <a href="#">8</a>
                </li>
                <li>
                  {" "}
                  <a href="#">9</a>
                </li> */}
                <li className="pagination__forward">
                  <a href="#">
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#angle`} />
                      </svg>
                    </div>
                  </a>
                </li>
                <li className="pagination__end">
                  {" "}
                  <a href="#">
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#doubleangle`} />
                      </svg>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>

    
        </div>
      </div>
    </body>
  );
};

export default Lend;
