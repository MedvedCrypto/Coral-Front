import React, { useEffect, useState } from "react";
import sprite from "../../images/sprite.svg";
import usdImg from "../../images/dist/usd.webp";

interface TraderProps {
  fiatOptions: any[];
}

const Offer: React.FC<TraderProps> = ({
  fiatOptions,
  selectedCrypto,
  setSelectedCrypto,
  d
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Состояние для управления открытием

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev); // Переключаем состояние
  };

  return (
    <>
      <div className="select select_single">
        {d ? ("") : (<div className="select__label">Currency (FIAT)</div>)}
        <div className="select__inner">
          <div className="select__selected select-js" onClick={toggleDropdown}>
            <input className="select__input" type="hidden" name="currency" />
            <div className="select__col">
              <div className="select__img">
                <img src={usdImg} alt="" />
              </div>
              <div className="select__text select__text_txt-uppercase select-txt-js">
                usd
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
          <div className={`select__dropdown scroll-js ${isDropdownOpen ? 'show' : ''}`}>
            {fiatOptions.map((fiat) => (
              <div
                key={fiat.value}
                className="select__item select-item-js"
                onClick={() => {
                  setSelectedCrypto(fiat);
                  setIsDropdownOpen(false); // Закрываем дропдаун после выбора
                }}
                data-val={fiat.value}
                data-text={fiat.text}
              >
                <div className="select__col">
                  <div className="select__img">
                    <img className="select-img-js" src={fiat.imgSrc} alt="" />
                  </div>
                  <div className="select__text">{fiat.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Offer;
