import React, { useCallback, useContext, useEffect, useState } from "react";
import sprite from "/images/sprite.svg";



const Arrow: React.FC = () => {


  return (
    <>
    <svg
    width={43}
    height={16}
    viewBox="0 0 43 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M42.2071 8.70711C42.5976 8.31658 42.5976 7.68342 42.2071 7.29289L35.8431 0.928932C35.4526 0.538408 34.8195 0.538408 34.4289 0.928932C34.0384 1.31946 34.0384 1.95262 34.4289 2.34315L40.0858 8L34.4289 13.6569C34.0384 14.0474 34.0384 14.6805 34.4289 15.0711C34.8195 15.4616 35.4526 15.4616 35.8431 15.0711L42.2071 8.70711ZM0 9H41.5V7H0V9Z"
      fill="#F2284E"
    />
  </svg>
  <div className="icon" style={{ display: "none" }}>
    <svg>
      <use xlinkHref={`${sprite}#check2`} />
    </svg>
  </div>
  </>
  );
};

export default Arrow;
