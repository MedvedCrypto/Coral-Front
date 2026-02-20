import React, { useCallback, useContext, useEffect, useState } from "react";
import $, { parseJSON } from "jquery";
import sprite from "../../images/sprite.svg";
import TxHashContext from "./../context/txHash.tsx";
import { btnPauseOrArchiveOffer, btnUpdateOffer } from "../buttons/btnLend.ts";
import { OfferState } from "../../common/codegen/Offer.types.ts";
import { NumericFormat } from "react-number-format";
import bankImg from "../../images/dist/bank.webp";
// import "../js/app.min.js";


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
import Bank from "../../images/dist/bank.webp";


const paymentMethods: PaymentMethod[] = [
  { value: "ppl", text: "Paypal", imgSrc: payPalImg },
  { value: "bnk", text: "Bank", imgSrc: Bank },
  { value: "ws", text: "Wise", imgSrc: wiseImg },
];

const denom = 1_000_000;
// const denom = 1;

const openTrade: React.FC = ({
  offerId,
  methods,
  limit,
  priceRatio,
  fiat,
  // handleBtnOpenTrade,
  description,
  offer_type,
  state
}) => {
  const { txHash, setTxHash, setText } = useContext(TxHashContext);


  const m =  ()=> {  try {
    const parsedDescription = JSON.parse(description);
    return Array.isArray(parsedDescription.m) ? parsedDescription.m : [];
  } catch (error) {
    // console.error("Error parsing description:", error);
    return []; // Возвращаем пустой массив в случае ошибки
  }}

  const [selectedMethods, setSelectedMethods] = useState(m)

  const [minAmount, setMinAmount] = useState<string>(limit[0]);
  const [maxAmount, setMaxAmount] = useState<string>(limit[1]);
  const [offerType, setOfferType] = useState<"buy" | "sell">("sell");
  const [ownerContact, setOwnerContact] = useState<string>("");
  const [rate, setRate] = useState<string>(priceRatio);
  const [offers, setOffers] = useState([]);
  const [selectDropdown, setSelectDropdown] = useState(false);

  const toggleDropdown = () => {
    setSelectDropdown(prevState => !prevState);
  };

  const selectMethod = (value: string) => {
    setSelectedMethods((prevSelectedMethods) => {
      // Проверяем, уже ли выбран метод
      if (prevSelectedMethods.includes(value)) {
        // Удалить из выбора
        return prevSelectedMethods.filter((method) => method !== value);
      } else {
        // Проверяем, не превышает ли количество выбранных методов 3
        if (prevSelectedMethods.length < 3) {
          // Добавить в выбор
          return [...prevSelectedMethods, value];
        } else {
          setText("You can't select more than 3 methods."); // Сообщение или другое действие
          return prevSelectedMethods; // Возвращаем предыдущее состояние без изменений
        }
      }
    });
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

  useEffect(() => {

    $(".my-offers-edit-js").on("click", function () {
      var $currentOfferItem = $(this).parents(".my-offers__item");
      $currentOfferItem.find(".edit-js").slideDown();
      $currentOfferItem.find(".my-offers__item-inner-wrap").addClass("hide");

      $(".edit-js").not($currentOfferItem.find(".edit-js")).slideUp();
      $(".my-offers__item-inner-wrap")
        .not($currentOfferItem.find(".my-offers__item-inner-wrap"))
        .removeClass("hide");
    });

    $(".my-offers-edit-cancel-js").on("click", function () {
      var $currentOfferItem = $(this).parents(".my-offers__item");
      $currentOfferItem.find(".edit-js").slideUp();
      $currentOfferItem.find(".my-offers__item-inner-wrap").removeClass("hide");
    });
    

  }, []);

  const handleBtnPauseOrArchive = async (state: OfferState) => {
    const offerData = {
      description: description,
      id: offerId,
      min_amount: String(limit[0]),
      max_amount: String(limit[1]),
      rate: String(priceRatio),
      state: state as OfferState,
      // "active" | "paused" | "archive"
    };

    console.log("Offer Data:", offerData);
    setTxHash("");
    setText("Waiting for confirmation...");
    const tx = await btnPauseOrArchiveOffer(offerData);
    if (tx.e) {
      setTxHash("");
      setText(tx.e);
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
    }
  };

  const handleBtnUpdateOffer = async () => {
    const errors = [];

    if (rate === "") {
      errors.push("Enter a Rate! \n\n");
    }

    if (ownerContact === undefined) {
      errors.push("Enter you telegram username! \n\n");
    }

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
      description: JSON.stringify({ m: selectedMethods }),
      id: offerId,
      min_amount: String(minAmount),
      max_amount: String(maxAmount),
      rate: String(rate),
      state: state as OfferState,
      // "active" | "paused" | "archive"
    };

    console.log("Offer Data:", offerData);
    setTxHash("");
    setText("Waiting for confirmation...");
    const tx = await btnUpdateOffer(offerData);
    if (tx.e) {
      setTxHash("");
      setText(tx.e);
    } else if (tx) {
      setText("Executed!");
      setTxHash(tx);
    }
  };

  const ActionButton = ({ label, onClick, style }) => (
    <div className="select__inner" style={style}>
      <div className="select__selected select-js" onClick={onClick}>
        <input className="select__input" type="hidden" name="status" />
        <div className="select__text select-txt-js">{label}</div>
      </div>
    </div>
  );



  const convertedFiat = fiat.replace(/_/g, "").toUpperCase();
  if (state === "archive") {
    return <></>;
  } else {
    return (
      <div className="my-offers__item">
        <div className="my-offers__item-inner">
          <div className="my-offers__item-inner-wrap">
            <div className="my-offers__status">
              {" "}
              <span style={{padding: "0.45rem"}}>  <div className="my-offers__type" style={{    "marginRight": 0}}>{state.charAt(0).toUpperCase() + state.slice(1)}</div>  </span>
            </div>
            <div className="my-offers__type">{offer_type === "sell" ? "Selling" : "Buying"}</div>
            <div className="my-offers__limits">
              <div className="my-offers__label">Limits</div>
              {limit
                ? `${limit[0] / denom || "..."}-${limit[1] / denom || "..."}`
                : ""}{" "}
              USDC
              <div className="input__message">
                {`${fiat.replace(/_/g, "").toUpperCase()} ${new Intl.NumberFormat().format((limit[0] / denom) * priceRatio)} - ${fiat.replace(/_/g, "").toUpperCase()} ${new Intl.NumberFormat().format((limit[1] / denom) * priceRatio)}`}
              </div>
            </div>
            <div className="my-offers__info">
              <div style={{ display: "flex" }}>
                {description ? (
                  <>
                    {" "}
                    {(() => {
                      try {
                        const methods = JSON.parse(description).m || [];

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
                                  </>
                                ) : (
                                  <div className="sellers-table__payment-name">
                                    Неизвестный метод
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
            <div className="my-offers__currency-wrap">
              <div>
                <div className="my-offers__label">Price ratio</div>
                {/* <p>2% below market</p> */}
                <p>
                  1 USDC = {convertedFiat} {priceRatio}
                </p>
              </div>
              <div className="btn btn_gray my-offers-edit-js">Edit</div>
            </div>
          </div>
          <div className="my-offers__edit-form edit edit-js">
            <div className="edit__top">
              <div className="edit__top-col" style={{ display: "flex" }}>
                <div className="my-offers__status">
                  {" "}
                  <span style={{padding: "0.45rem"}}>  <div className="my-offers__type" style={{    "marginRight": 0}}>{state.charAt(0).toUpperCase() + state.slice(1)}</div>  </span>
                </div>
                <div className="my-offers__type">
                  {offer_type === "sell" ? "Selling" : "Buying"}
                </div>
              </div>
              <div className="edit__top-col">
                <div
                  className="select select_single"
                  style={{ minWidth: "4.875rem" }}
                >
                  <div className="select__text select-txt-js">
                    <div style={{ display: "flex", marginLeft: 24 }}>
                      {state === "paused" ? (
                        <>
                          <ActionButton
                            label="Activate"
                            onClick={() => handleBtnPauseOrArchive("active")}
                          />
                          <ActionButton
                            label="Delete"
                            onClick={() => handleBtnPauseOrArchive("archive")}
                            style={{ marginLeft: 12 }}
                          />
                        </>
                      ) : (
                        <>
                          <ActionButton
                            label="Pause"
                            onClick={() => handleBtnPauseOrArchive("paused")}
                          />
                          <ActionButton
                            label="Delete"
                            onClick={() => handleBtnPauseOrArchive("archive")}
                            style={{ marginLeft: 12 }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="edit__top-col">
                <div className="my-offers__currency">
                 {fiat.replace(/_/g, "").toUpperCase()}
                </div>
              </div>
            </div>
            <form action="">
              <div className="edit__form">
                <div className="edit__input-col">
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
                      decimalScale={0}
                      thousandSeparator={true}
                      allowNegative={false}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="edit__input-col">
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
                      decimalScale={0}
                      thousandSeparator={true}
                      allowNegative={false}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div className="edit__input-col">
                  <div className="select select_single">
                    <div className="input">
                      <label htmlFor="margin">Rate</label>
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
                        placeholder="1.012"
                      />
                    </div>
                  </div>
                </div>

                <div className="edit__input-col" >
                <div className="select select_multiple">
                <label htmlFor="margin" style={{    color: '#dedede',
    display: 'inline-flex',
    fontSize: '.875rem',
    marginBottom: '.9375rem'}}>Method</label>
      <div className="select__inner">
        <div className={`select__selected ${selectDropdown?("active"):("")}`} onClick={toggleDropdown}>
          <div className="select__col">
            <div className="select__img">
              <img src={bankImg} alt="" />
            </div>
            <div className="select__text select-txt-js">
              {getSelectedMethodText()}
            </div>
          </div>
          <div className="select__col">
            <div className="icon">
              <svg>
                <use xlinkHref={`${sprite}#angle`} />
              </svg>
            </div>
          </div>
        </div>
        <div className={`select__dropdown  ${selectDropdown?("active"):("")}`}>
          {paymentMethods.map((method) => (
            <label
              className="select__item select-item-js"
              key={method.value}
              data-val={method.value}
              data-text={method.text}
            >
              <div className="select__col">
                <div className="select__img">
                  <img src={method.imgSrc} alt="" />
                </div>
                <div className="select__text">{method.text}</div>
              </div>
              <div className="select__col">
                <div className="select__checkbox">
                  <input
                    type="checkbox"
                    name={method.text}
                    id={method.text}
                    defaultValue={method.text}
                    checked={selectedMethods.includes(method.value)} // Устанавливаем состояние чекбокса
                    onClick={(e) => {
                      e.stopPropagation(); // Останавливаем всплытие события
                      selectMethod(method.value);
                    }}
                  />
                  <span className={selectedMethods.includes(method.value) ? "active_check" : ""}>
                    <div className="icon">
                      <svg>
                        <use xlinkHref={`${sprite}#check`} />
                      </svg>
                    </div>
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
                </div>
              </div>
              <div className="edit__form-bottom">
                <div className="popup__bottom">
                  <div className="popup__bottom-col">
                    <p>
                      1 USDC = {(rate || priceRatio) * 1} {fiat.replace(/_/g, "").toUpperCase()}
                    </p>
                    <p>
                      <div className="input__message">
                        Limits:{" "}
                        {`${fiat.replace(/_/g, "").toUpperCase()} ${new Intl.NumberFormat().format((limit[0] / denom) * (rate || priceRatio))} - ${fiat.replace(/_/g, "").toUpperCase()} ${new Intl.NumberFormat().format((limit[1] / denom) * (rate || priceRatio))}`}
                      </div>
                    </p>
                  </div>
                </div>

                <div
                  className="edit__form-bottom-btn-wrap"
                  style={{ position: "relative", marginLeft: "auto" }}
                >
                  <div className="btn btn_cancel my-offers-edit-cancel-js">
                    Cancel
                  </div>
                  <div
                    className="btn btn_accent btn_centered"
                    onClick={() => handleBtnUpdateOffer()}
                  >
                    Update
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
};

export default openTrade;
