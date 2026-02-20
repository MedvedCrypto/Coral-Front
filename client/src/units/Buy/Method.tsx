import React, { useEffect, useState } from "react";
import sprite from "/images/sprite.svg";
import "../js/app.min.js";
import $ from "jquery"; // Импортируем jQuery

interface TraderProps {
  paymentMethods: any[]
  fiatOptions: any[];
}

import bankImg from "../../images/dist/bank.webp";

const Method: React.FC<TraderProps> = ({
  paymentMethods,
  getSelectedMethodText,
  selectedMethods,
  selectMethod,
  d,
  d2
}) => {


  

  return (
    <>
      <div className="select select_multiple">
        {d?(""):(<div className="select__label">Payment method</div>)}
        {d2?(<div className="select__label" style={{opacity: 0}}>Payment method</div>):("")}
        <div className="select__inner">
          <div className="select__selected select-js">
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
          <div className="select__dropdown scroll-js">
            {paymentMethods.map((method) => (
              <label
                className="select__item"
                htmlFor={method.value}
                onClick={() => selectMethod(method.value)}
              >
                <div className="select__col">
                  <div className="select__img">
                    {" "}
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
                    />
                    <span
                      className={
                        selectedMethods.includes(method.value)
                          ? "active_check"
                          : ""
                      }
                    >
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
    </>
  );
};

export default Method;
