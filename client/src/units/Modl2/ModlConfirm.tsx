import { useContext, useEffect, useState } from 'react';
import TxHashContext from '../context/txHash';
import ReactModal from "react-modal";
import "../../css/style2.css";

const ModalConfirm = ({onClickConfirm, setIsVisible, isVisible}) => {

    const [confirmed1, setConfirmed1] = useState(false);
    const [confirmed2, setConfirmed2] = useState(false);
  
    const handleRequestClose = () => {
      setIsVisible(false);
      setConfirmed1(false)
      setConfirmed2(false)
    };



  return (
    <ReactModal
      isOpen={isVisible}
      onRequestClose={handleRequestClose}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: "2147483646",
          backgroundColor: "rgba(0, 0, 0, 0.8)" // Полупрозрачный фон
        },
        content: {
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          border: "0px",
          backgroundColor: "#19191c",
          color: "#fff",
          WebkitOverflowScrolling: "touch",
          outline: "none",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          height: "50vh",
          width: "50vh",
          maxWidth: "90vw",
          margin: "auto"
        },
      }}
    >
      
      <div style={{ margin: "20px 0", fontSize: "1.5rem" }}>
        <label>
          <input 
            type="checkbox" 
            checked={confirmed1} 
            onChange={() => setConfirmed1(!confirmed1)} 
          />
          &nbsp; Confirm 1
        </label>
      </div>
      <div style={{ margin: "20px 0", fontSize: "1.5rem" }}>
        <label>
          <input 
            type="checkbox" 
            checked={confirmed2} 
            onChange={() => setConfirmed2(!confirmed2)} 
          />
          &nbsp; Confirm 2
        </label>
      </div>

      <button 
        onClick={onClickConfirm} 
        disabled={!confirmed1 || !confirmed2} 
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#f2284e",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: confirmed1 && confirmed2 ? "pointer" : "not-allowed"
        }}
      >
        Confirm
      </button>
      
    </ReactModal>
  );
};

export default ModalConfirm;
