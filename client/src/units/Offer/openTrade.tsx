import React, { useCallback, useContext, useEffect, useState } from "react";


const openTrade: React.FC = ({ userName = "user", amount = 0, status = "status", time = "time" }) => {
  return (
    <div className="trades__item-inner">
    <div className="trades__col">
      <div className="trades__item-name">Buying axlUSDC</div>
      <div className="trades__item-user trades__item-label">
        from {userName}
      </div>
    </div>
    <div className="trades__col">
      <div className="trades__item-label">Amount</div>
      <div className="trades__item-content">{amount} axlUSDC</div>
    </div>
    <div className="trades__col">
      <div className="trades__item-label">Status</div>
      <div className="trades__item-content trades__item-content_accent">
        {/* Waiting for funds */}
        {status}
      </div>
    </div>
    <div className="trades__col">
      <div>
        <div className="trades__item-label">Time remaining</div>
        <div className="trades__item-content">{time}</div>
      </div>
      <a className="btn btn_accent">
        View trade{" "}
      </a>
    </div>
  </div>
  );
};

export default openTrade;
