import React, { useEffect, useState } from "react";
import TradesCount from "./TradesCount";
import TraderRang from "./Rang";
import { NumericFormat } from "react-number-format";
import sprite from "/images/sprite.svg";
import $ from "jquery"; // Импортируем jQuery

const denom = 1_000_000;
// const denom = 1;

const paymentMethods: PaymentMethod[] = [
  // { value: "all", text: "All", imgSrc: "" },
  { value: "ppl", text: "Paypal" },
  { value: "bnk", text: "Bank" },
  { value: "ws", text: "Wise" },
];

interface TraderProps {
  ownerAddress: string;
  offerId: number;
  trades: number;
  offerMakerAddress: string;
  percent: number;
  limit: number[];
  maker: string; // Добавьте недостающие пропсы
  crypto: string;
  priceRatio: number;
  fiat: string;
  setIWillPay: (pay: number) => void;
  iWillPay: number;
  setIWillPayFiat: (pay: number) => void;
  iWillPayFiat: number;
  handleBtnOpenTrade: (
    offerId: number,
    iWillPay: number,
    telegramId: string,
    offerMakerAddress: string
  ) => void;
  setTelegramId: (id: string) => void;
  telegramId: string;
  type: string;
  method: string[];
}

const Offer: React.FC<TraderProps> = ({
  ownerAddress,
  offerMakerAddress,
  methods,
  offerId,
  type,
  maker,
  percent,
  trades,
  limit,
  crypto,
  priceRatio,
  fiat,
  setIWillPay,
  iWillPay,
  setIWillPayFiat,
  iWillPayFiat,
  handleBtnOpenTrade,
  setTelegramId,
  telegramId,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedVar, setSelectedVar] = useState("");
  const [localIwillPay, setLocalIwillPay] = useState(0);
  const [localIwillPayFiat, setLocalIwillPayFiat] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTelegramId(event.target.value);
  };

  const handleInfoClick = () => {
    setShowInfo(!showInfo);
  };

  const setIWillPayHandle = (pay: number) => {
    if (selectedVar === "buy") {
      setIWillPay(pay);
      setLocalIwillPay(pay);
      setIWillPayFiat(pay * priceRatio);
      setLocalIwillPayFiat(pay * priceRatio);
    }
  };

  const setIWillPayFiatHandle = (pay: number) => {
    if (selectedVar === "sell") {
      setLocalIwillPayFiat(pay);
      setIWillPayFiat(pay);
      setIWillPay(pay / priceRatio);
      setLocalIwillPay(pay / priceRatio);
    }
  };

  let result;
  if (maker) {
    const first8 = maker.slice(0, 10);
    const last5 = maker.slice(-3);
    result = `${first8}...${last5}`;
  }

  useEffect(() => {
    const widths: number[] = [];

    $(".seller-tr-js").each(function () {
      $(this)
        .find(".seller-td-js")
        .each(function (index) {
          const width = $(this).outerWidth();
          if (widths[index] === undefined || width > widths[index]) {
            widths[index] = width;
          }
        });
    });

    $(".seller-tr-js").each(function () {
      $(this)
        .find(".seller-td-js")
        .each(function (index) {
          $(this).css("width", widths[index]);
        });
    });

    $(".sellers-thead-js .seller-th-js").each(function (index) {
      $(this).css("width", widths[index]);
    });

    $(".seller-buy-js").on("click", function (event) {
      event.preventDefault();
      const row = $(this).parents(".seller-tr-js");
      $(".seller-tr-js").not(row).removeClass("active");
      $(".sellers-table__tr-bottom")
        .not(row.find(".sellers-table__tr-bottom"))
        .slideUp();
      row.addClass("active");
      row.find(".sellers-table__tr-bottom").slideDown();
    });

    $(".seller-cancel-js").on("click", function (event) {
      event.preventDefault();
      const row = $(this).parents(".seller-tr-js");
      row.removeClass("active");
      row.find(".sellers-table__tr-bottom").slideUp();
    });

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
      $(this).parents(".seller-tr-js").removeClass("active");
      $(this)
        .parents(".seller-tr-js")
        .find(".sellers-table__tr-bottom")
        .slideUp();
    });

    // Очистка обработчиков событий при размонтировании компонента
    return () => {
      $(".seller-buy-js").off("click");
      $(".seller-cancel-js").off("click");
    };
  }, [ownerAddress, trades]);

  return (
    <div className="sellers-table__tr seller-tr-js">
      <div className="sellers-table__tr-top">
        <div className="sellers-table__td sellers-table__td_tarder seller-td-js">
          <div className="sellers-table__trader">
            <div className="sellers-table__trader-name-wrap">
              <div className="sellers-table__trader-name">
                {result ? result : ""}
              </div>
            </div>
            <div className="sellers-table__trader-info">
              <TradesCount trades={trades} />
              <TraderRang percent={percent} />
              <div className="sellers-table__counter">
                refresh in <span>20</span>s
              </div>
            </div>
          </div>
        </div>
        <div className="sellers-table__td sellers-table__td_hidden">
          <div className="sellers-table__payment">
            <div
              className="sellers-table__payment-col"
              style={{ display: "flex" }}
            >
              {methods && (
                <>
                  {" "}
                  {methods.map(
                    (method: any, index: React.Key | null | undefined) => {
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
                              <div
                                className="sellers-table__payment-name"
                                style={{ marginRight: ".5rem" }}
                              >
                                {paymentMethod.text}
                              </div>
                              {paymentMethod.imgSrc && (
                                <img
                                  src={paymentMethod.imgSrc}
                                  alt={paymentMethod.text}
                                />
                              )}
                            </>
                          ) : (
                            <div className="sellers-table__payment-name">
                              Error
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </>
              )}
            </div>
            <div className="sellers-table__payment-col">
              <div className="sellers-table__counter">
                refresh in <span>20</span>s
              </div>
              <p>
                1 {crypto} =  {priceRatio}{" "}{fiat.text}
              </p>
            </div>
          </div>
        </div>
        <div className="sellers-table__td sellers-table__td_price seller-td-js">
          <div className="sellers-table__price">
         {priceRatio}{" "}<img
                  className="iconPrice"
                  src={fiat.imgSrc}
                  style={{marginRight: 4, marginLeft: 8}}
                />{fiat.text} 
          </div>
        </div>
        <div className="sellers-table__td sellers-table__td_trade-limit seller-td-js">
          <div className="sellers-table__trade-limit">
            {/* <div className="sellers-table__trade-limit-label">Trade limit</div> */}
            <div className="sellers-table__trade-limit-count">
              {" "}
              <span className="sellers-table__price">
                {limit
                  ? `${limit[0] / denom || "..."}-${limit[1] / denom || "..."}`
                  : ""}{" "}
                  <img
                  className="iconPrice"
                  src="https://app.osmosis.zone/tokens/generated/usdc.svg"
                  style={{marginRight: 4, marginLeft: 8}}
                />{" "}
                {crypto}
              </span>
              <div className="input__message" style={{ display: "flex" }}>
                {" "}
                {new Intl.NumberFormat().format(
                  (limit[0] / denom) * priceRatio
                )}{" "}
                -{" "}
                {new Intl.NumberFormat().format(
                  (limit[1] / denom) * priceRatio
                )}{" "}
                {fiat.text}
              </div>
            </div>
          </div>
        </div>
        <div className="sellers-table__td sellers-table__td_payment seller-td-js">
          <div className="sellers-table__payment">
            {methods && (
              <>
                {" "}
                {methods.map(
                  (method: any, index: React.Key | null | undefined) => {
                    const paymentMethod = paymentMethods.find(
                      (pm) => pm.value === method
                    );
                    return (
                      <div className="sellers-table__payment-item" key={index}>
                        {/* Проверяем, найден ли соответствующий объект */}
                        {paymentMethod ? (
                          <>
                            <div
                              className="sellers-table__payment-name"
                              style={{ marginRight: ".5rem" }}
                            >
                              {paymentMethod.text}
                            </div>
                            {paymentMethod.imgSrc && (
                              <img
                                src={paymentMethod.imgSrc}
                                alt={paymentMethod.text}
                              />
                            )}
                          </>
                        ) : (
                          <div className="sellers-table__payment-name">
                            Unknown
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </>
            )}

            <div className="sellers-table__payment-item sellers-table__payment-item_cur">
              <div className="sellers-table__price">
                {fiat.text} {priceRatio}{" "}
              </div>
            </div>
            <div className="sellers-table__payment-item">
              <a className="btn btn_accent seller-buy-js">
                {type !== "buy" ? "Buy" : "Sell"}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="sellers-table__tr-bottom">
        <form className="sellers-table__form" action="" id="table-form">
          <div className="input-wrap">
            <div className="input-col">
              <div className="input">
                <label htmlFor="buy">
                  I want to {type !== "buy" ? "Buy" : "Sell"}
                </label>
                <NumericFormat
                  onClick={() => setSelectedVar("buy")}
                  id="buy"
                  value={
                    localIwillPay === 0
                      ? ""
                      : localIwillPay.toString().replace(/[^0-9.]/g, "")
                  }
                  onValueChange={(values) => {
                    const { value } = values;
                    const parsedValue = parseFloat(
                      value.replace(/[^0-9.]/g, "")
                    );
                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                      // Check if valid and non-negative
                      setIWillPayHandle(parsedValue);
                    } else {
                      setIWillPayHandle(0); // Reset to 0 if invalid or negative
                    }
                  }}
                  decimalScale={2}
                  thousandSeparator={true}
                  allowNegative={false}
                  placeholder={`${limit[1] / denom} ${crypto}`}
                />
                <div className="input__message">
                  {limit
                    ? `${new Intl.NumberFormat().format(limit[0] / denom || "...")} - ${new Intl.NumberFormat().format(limit[1] / denom || "...")}`
                    : ""}{" "}
                  {crypto}{" "}
                </div>
              </div>
            </div>
            <div className="input-col">
              <div className="input">
                <label htmlFor="pay">
                  I will {type !== "buy" ? "pay" : "get"}
                </label>
                <NumericFormat
                  onClick={() => setSelectedVar("sell")}
                  id="pay"
                  value={
                    localIwillPayFiat === 0
                      ? ""
                      : localIwillPayFiat.toString().replace(/[^0-9.]/g, "")
                  }
                  onValueChange={(values) => {
                    const { value } = values;
                    const parsedValue = parseFloat(
                      value.replace(/[^0-9.]/g, "")
                    );
                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                      // Check if valid and non-negative
                      setIWillPayFiatHandle(parsedValue);
                    } else {
                      setIWillPayFiatHandle(0); // Reset to 0 if invalid or negative
                    }
                  }}
                  decimalScale={2}
                  thousandSeparator={true}
                  allowNegative={false}
                  placeholder={`${(limit[1] / denom) * priceRatio} ${fiat.text}`}
                />
              <div className="input__message" style={{ display: "flex" }}>
                {" "}
                {new Intl.NumberFormat().format(
                  (limit[0] / denom) * priceRatio
                )}{" "}
                -{" "}
                {new Intl.NumberFormat().format(
                  (limit[1] / denom) * priceRatio
                )}{" "}
                {fiat.text}
              </div>
              </div>
            </div>
            <div className="input-col">
              {/* <div className="input">
                <label htmlFor="telegram">
                  Your Telegram username
                  <div className="input__info" onClick={handleInfoClick}>
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#questionmark`} />
                      </svg>
                    </div>
                    {showInfo && (
                      <div className="input__info-window">
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Quidem accusamus rem tempora iste possimus. Ad.
                        </p>
                        <p>
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Non, necessitatibus!
                        </p>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  id="telegram"
                  type="text"
                  name="telegram"
                  placeholder="@username"
                  value={telegramId}
                  onChange={handleInputChange}
                />
              </div> */}
            </div>
          </div>
          <div className="sellers-table__form-bottom">
            <div className="sellers-table__form-bottom-col">
              <p>Trade time limit</p>
              <span>12 hours</span>
            </div>
            <div className="sellers-table__form-bottom-col">
              <div className="sellers-table__form-btn-wrap">
                <div className="btn btn_cancel seller-cancel-js">Cancel</div>
                <div
                  className="btn btn_accent "
                  onClick={() =>
                    handleBtnOpenTrade(
                      offerId,
                      iWillPay,
                      telegramId,
                      ownerAddress
                    )
                  }
                >
                  Open trade
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Offer;
