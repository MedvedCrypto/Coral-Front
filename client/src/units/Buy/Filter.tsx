import React, { useState } from "react";
import TradesCount from "./TradesCount";
import TraderRang from "./Rang";
import { NumericFormat } from "react-number-format";
import sprite from "/images/sprite.svg";

interface TraderProps {
  fiatOptions: any[];
}

import bankImg from "../../images/dist/bank.webp";

const Method: React.FC<TraderProps> = ({
  paymentMethods,
  getSelectedMethodText,
  selectedMethods,
  selectMethod,
}) => {
  return (
    <>
    <div>
      <div className="filter__list">
        <ul>
          <li>
            <label htmlFor="price">
              Price: lowest to highest
              <input
                id="price"
                type="radio"
                name="sort"
                value="percent"
                checked={sortBy === "percent"}
                onChange={handleSortChange}
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
                onChange={handleSortChange}
              />
              <span />
            </label>
          </li>
        </ul>
      </div>

      <div className="sellers-table__tbody">
        {sortedOffers.map((offer, index) => (
          <Offer
            key={index}
            percent={offer.percent}
            trades={offer.trades}
            // ... other props for Offer
          />
        ))}
      </div>
    </div>
    </>
  );
};

export default Method;
