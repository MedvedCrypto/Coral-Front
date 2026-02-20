import React, { useState } from "react";
import TradesCount from "./TradesCount";
import TraderRang from "./Rang";
import { NumericFormat } from "react-number-format";
import sprite from "/images/sprite.svg";

interface TraderProps {
  cryptoOptions: any[];
}

import usdcImg from '/images/dist/axl.webp';

const Offer: React.FC<TraderProps> = ({
  cryptoOptions,
  selectedCrypto,
  setSelectedCrypto
}) => {



  return (
    <>
<div className="offer__input-inner" style={{cursor: "default"}}>
        <div className="select select_single" style={{cursor: "default", minWidth: "7.375rem"}}>
          <div className="select__inner" style={{cursor: "default"}}>
            <div className="select__selected" style={{cursor: "default"}}>
              <input
                className="select__input"
                type="hidden"
                name="crypto"
                value={selectedCrypto.value}
              />
              <div className="select__col">
              <div className="select__img">
                            {" "}
                            <img
                              className="select-img-js"
                              src={usdcImg}
                              alt=""
                            />
                          </div>
                <div className="select__text select-txt-js">
                  {selectedCrypto.text}
                </div>
              </div>
            </div>
            <div className="select__dropdown">
              {cryptoOptions.map((crypto) => (
                <div
                  key={crypto.value}
                  className="select__item select-item-js"
                  onClick={() => setSelectedCrypto(crypto)}
                  data-val={crypto.value}
                  data-text={crypto.text}
                >
                  <div className="select__col">
                    <div className="select__img">
                      <img
                        className="select-img-js"
                        src={crypto.imgSrc}
                        alt=""
                      />
                    </div>
                    <div className="select__text">{crypto.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
  );
};

export default Offer;
